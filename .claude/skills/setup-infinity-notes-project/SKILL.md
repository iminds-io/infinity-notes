---
name: setup-infinity-notes-project
description: Use when creating a new infinity notes project, scaffolding from the template, configuring site metadata, or authoring interconnected note content.
---

# Setting Up an Infinity Notes Project

## Overview

A new project is created by copying the bundled template and interpolating four placeholder tokens. After scaffolding, replace the starter notes with real content and install dependencies.

## Scaffolding

The `copyTemplate` utility handles the copy + interpolation in one step. Use `tsx` to invoke it directly (the CLI binary needs a TTY):

```typescript
// one-off scaffold script — save to /tmp/scaffold.ts, delete after use
// Note: wrap in async function; tsx rejects top-level await in CJS mode
import path from 'path'
import os from 'os'
import {copyTemplate} from '/Users/pureicis/dev/infinity-notes/packages/create-infinity-notes/src/copy-template'

async function run() {
  await copyTemplate(
    path.join('/Users/pureicis/dev/infinity-notes/packages/create-infinity-notes/template'),
    path.join(os.homedir(), 'dev/infinity-notes/examples/my-project'),
    {
      __PROJECT_NAME__: 'my-project',
      __SITE_TITLE__:   'My Notes',
      __SITE_DESCRIPTION__: 'A short description',
      __AUTHOR_NAME__:  'Author Name',   // leave '' if unknown
    },
  )
  console.log('Done.')
}

run().catch(console.error)
```

Run with: `npx tsx /tmp/scaffold.ts`

Then install dependencies in the new project:
```bash
cd ~/dev/infinity-notes/examples/my-project && npm install
```

## Placeholder Reference

| Token | Where it appears |
|---|---|
| `__PROJECT_NAME__` | `package.json` → `name` |
| `__SITE_TITLE__` | `pages/_app.tsx` title/meta, `app/components/header.tsx` h1, `notes/Welcome.md` frontmatter |
| `__SITE_DESCRIPTION__` | `pages/_app.tsx` meta description / og:description |
| `__AUTHOR_NAME__` | `package.json` → `author` |

## After Scaffolding: Replace Starter Notes

The template ships four placeholder notes (`Welcome.md`, `Getting Started.md`, `Example Note.md`, `About.md`). **Replace them** with project-specific content — or delete the ones you don't need. The homepage is always `Welcome.md` (hardcoded as `NOTE_INDEX_NAME = 'Welcome'`).

## Note Format

```markdown
---
title: Display Title        # optional — defaults to filename
snippet: One-line preview   # optional — auto-generated if omitted
---

# Heading

Body content. Link to other notes with [[Note Name]].
```

**Snippet auto-generation:** strips all heading lines, takes first 2 non-empty lines. Put your most descriptive content first if you skip the `snippet` field.

**Backlink syntax:** `[[Filename Without Extension]]` — case-sensitive, must match the `.md` filename exactly. A note automatically appears in the "Links to this note" section of every note it references.

## Note Authoring Checklist

- [ ] `Welcome.md` exists (homepage) and links into the rest of the content
- [ ] Every note links to at least one other note with `[[Name]]`
- [ ] Filenames are human-readable (they become URL paths)
- [ ] No leftover placeholder tokens (`__SITE_TITLE__` etc.) anywhere in `notes/`

## Verify Interpolation

```bash
grep -r "__PROJECT_NAME__\|__SITE_TITLE__\|__SITE_DESCRIPTION__\|__AUTHOR_NAME__" \
  examples/my-project/ && echo "FAIL: placeholders remain" || echo "PASS"
```
