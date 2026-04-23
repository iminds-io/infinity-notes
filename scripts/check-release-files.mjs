#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const publicExamplePrefixes = ["examples/README.md", "examples/demo-basic/"];
const forbiddenPackagePatterns = [
  /^examples\//,
  /(^|\/)node_modules\//,
  /(^|\/)\.next\//,
  /(^|\/)\.wrangler\//,
  /(^|\/)\.env($|[./-])/,
  /(^|\/)wrangler-state\//,
];

const errors = [];

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    shell: false,
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, filePath), "utf8"));
}

function isPublicExample(filePath) {
  return publicExamplePrefixes.some((prefix) => filePath === prefix || filePath.startsWith(prefix));
}

function assertGitVisibleExamplesArePublic() {
  const result = run("git", ["status", "--porcelain", "--untracked-files=all", "--", "examples"]);
  if (result.status !== 0) {
    errors.push(`Unable to inspect examples git status:\n${result.stderr}`);
    return;
  }

  const visibleFiles = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3))
    .filter((filePath) => filePath.startsWith("examples/"));

  const privateFiles = visibleFiles.filter((filePath) => !isPublicExample(filePath));
  if (privateFiles.length > 0) {
    errors.push(
      [
        "Private/generated example files are visible to git:",
        ...privateFiles.slice(0, 20).map((filePath) => `  - ${filePath}`),
        privateFiles.length > 20 ? `  - ...and ${privateFiles.length - 20} more` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

function assertPackageAllowlists(packages) {
  for (const packageDir of packages) {
    const manifestPath = path.join(packageDir, "package.json");
    const manifest = readJson(manifestPath);

    if (manifest.private === true) {
      continue;
    }

    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
      errors.push(`${manifestPath} must define a non-empty "files" allowlist.`);
    }
  }
}

function assertPackPayloads(packages) {
  for (const packageDir of packages) {
    const manifest = readJson(path.join(packageDir, "package.json"));
    if (manifest.private === true) {
      continue;
    }

    const result = run("npm", ["pack", "--dry-run", "--json"], {
      cwd: path.join(repoRoot, packageDir),
    });

    if (result.status !== 0) {
      errors.push(`npm pack dry-run failed for ${packageDir}:\n${result.stderr || result.stdout}`);
      continue;
    }

    let packOutput;
    try {
      packOutput = JSON.parse(result.stdout);
    } catch (error) {
      errors.push(`Unable to parse npm pack output for ${packageDir}: ${error.message}`);
      continue;
    }

    const files = packOutput.flatMap((entry) => entry.files.map((file) => file.path));
    const forbiddenFiles = files.filter((filePath) =>
      forbiddenPackagePatterns.some((pattern) => pattern.test(filePath)),
    );

    if (forbiddenFiles.length > 0) {
      errors.push(
        [
          `${packageDir} npm payload includes forbidden files:`,
          ...forbiddenFiles.map((filePath) => `  - ${filePath}`),
        ].join("\n"),
      );
    }
  }
}

function main() {
  const rootManifest = readJson("package.json");
  const packages = rootManifest.workspaces.flatMap((workspacePattern) => {
    if (workspacePattern !== "packages/*") {
      errors.push(`Unsupported workspace pattern in release checker: ${workspacePattern}`);
      return [];
    }

    return fs
      .readdirSync(path.join(repoRoot, "packages"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `packages/${entry.name}`)
      .filter((packageDir) => fs.existsSync(path.join(repoRoot, packageDir, "package.json")))
      .sort();
  });

  assertGitVisibleExamplesArePublic();
  assertPackageAllowlists(packages);
  assertPackPayloads(packages);

  if (errors.length > 0) {
    console.error(errors.join("\n\n"));
    process.exit(1);
  }

  console.log(`Release file check passed for ${packages.length} packages.`);
}

main();
