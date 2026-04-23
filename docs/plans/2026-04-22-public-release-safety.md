# Public Release Safety Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add repository and npm packaging safeguards so Infinity Notes can be open sourced without private/generated examples.

**Architecture:** Keep one sanitized public example under `examples/demo-basic/`, ignore all other examples by default, add `files` allowlists to every publishable package, and verify the policy with a Node release-check script. The release check is intentionally conservative and runs `npm pack --dry-run --json` for each publishable package.

**Tech Stack:** Node.js, pnpm workspaces, npm pack dry-run, package.json `files`, git ignore rules.

---

### Task 1: Release Safety Test

**Files:**
- Create: `scripts/check-release-files.test.mjs`

**Step 1: Write the failing test**

Create a Node test that runs `node scripts/check-release-files.mjs` from the repo root and asserts exit code `0`.

**Step 2: Run test to verify it fails**

Run: `node --test scripts/check-release-files.test.mjs`

Expected: FAIL because `scripts/check-release-files.mjs` does not exist.

### Task 2: Release Safety Checker

**Files:**
- Create: `scripts/check-release-files.mjs`
- Modify: `package.json`

**Step 1: Implement the checker**

The script should inspect git-visible files under `examples/`, package `files` allowlists, and `npm pack --dry-run --json` payloads.

**Step 2: Wire scripts**

Add `test:release-files`, `pack:check`, and include `pnpm test:release-files` in `verify`.

**Step 3: Run test**

Run: `node --test scripts/check-release-files.test.mjs`

Expected: FAIL until ignore rules, allowlists, and public example files are in place.

### Task 3: Git Ignore Policy

**Files:**
- Modify: `.gitignore`

**Step 1: Add conservative ignores**

Ignore nested dependencies, build outputs, Wrangler state, env files, and all `examples/*` except `examples/README.md` and `examples/demo-basic/**`.

**Step 2: Run release test**

Run: `node --test scripts/check-release-files.test.mjs`

Expected: FAIL until package allowlists and sanitized example exist.

### Task 4: Sanitized Public Example

**Files:**
- Create: `examples/README.md`
- Create: `examples/demo-basic/README.md`
- Create: `examples/demo-basic/meta.json`
- Create: `examples/demo-basic/notes/Welcome.md`
- Create: `examples/demo-basic/notes/About.md`
- Create: `examples/demo-basic/notes/concepts/Compounding.md`
- Create: `examples/demo-basic/notes/concepts/Feedback Loop.md`
- Create: `examples/demo-basic/notes/threads/Small Notes Become Systems.md`

**Step 1: Add synthetic content**

Use only generic, invented content that demonstrates Infinity Notes relationships.

**Step 2: Run release test**

Run: `node --test scripts/check-release-files.test.mjs`

Expected: FAIL until package allowlists are complete.

### Task 5: Package Allowlists

**Files:**
- Modify: `packages/frontend/package.json`
- Modify: `packages/note-processor/package.json`
- Modify: `packages/worker/package.json`

**Step 1: Add `files` arrays**

Allow only source/build/config files needed by each package. Do not include repo-level examples, generated caches, or local runtime state.

**Step 2: Run release test**

Run: `node --test scripts/check-release-files.test.mjs`

Expected: PASS.

### Task 6: Verification

**Files:**
- No new files.

**Step 1: Run release check**

Run: `pnpm pack:check`

Expected: PASS with each package dry-run inspected.

**Step 2: Run full verification**

Run: `pnpm verify`

Expected: PASS, unless pre-existing unrelated package tests fail.
