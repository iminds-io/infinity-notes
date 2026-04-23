# README Usage Guide Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a README usage guide that explains how to run `create-infinity-notes` with both `npx` and a global install, then shows the interactive scaffold and upload flow.

**Architecture:** Keep the change documentation-only. Expand the existing "Create a Book" section so it matches the current CLI behavior in `packages/create-infinity-notes/src/index.ts` and the generated template files under `packages/create-infinity-notes/template/`.

**Tech Stack:** Markdown, npm, npx, pnpm workspace docs

---

### Task 1: Capture the documented CLI entrypoints

**Files:**
- Modify: `README.md`
- Reference: `packages/create-infinity-notes/src/index.ts`

**Step 1: Add install and run options**

Document both supported entrypoints:

- `npx create-infinity-notes my-book`
- `npm install -g create-infinity-notes`
- `create-infinity-notes my-book`

**Step 2: Keep the usage guide aligned with the real prompts**

Describe the current prompt sequence exactly as implemented:

- book title
- book id
- authors
- description
- R2 key prefix

### Task 2: Show the generated workflow end-to-end

**Files:**
- Modify: `README.md`
- Reference: `packages/create-infinity-notes/template/README.md`
- Reference: `packages/create-infinity-notes/template/upload.sh`

**Step 1: Document scaffold output**

Retain the generated directory tree and explain that the CLI creates a content directory ready for editing.

**Step 2: Document post-scaffold usage**

Show the normal workflow:

- `cd my-book`
- edit markdown under `notes/`
- run `./upload.sh my-book`

**Step 3: Document upload environment variables**

Name the supported overrides:

- `INFINITY_NOTES_BUCKET`
- `INFINITY_NOTES_R2_PREFIX`
- `INFINITY_NOTES_WORKER_URL`

### Task 3: Verify the docs change

**Files:**
- Verify: `README.md`

**Step 1: Read back the edited section**

Run: `sed -n '1,120p' README.md`
Expected: the "Create a Book" section includes both `npx` and global install flows plus the interactive prompt details.

**Step 2: Inspect the diff**

Run: `git diff -- README.md docs/plans/2026-04-23-readme-usage-guide.md`
Expected: only the README usage guide and plan file are changed.
