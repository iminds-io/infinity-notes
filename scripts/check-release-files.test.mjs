import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("release file safety", () => {
  it("accepts only the sanitized public example and allowlisted package payloads", () => {
    const result = spawnSync(process.execPath, ["scripts/check-release-files.mjs"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    assert.equal(
      result.status,
      0,
      `release file check failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  });
});
