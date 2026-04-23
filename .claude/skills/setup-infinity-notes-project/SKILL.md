---
name: setup-infinity-notes-project
description: Use when creating a new infinity notes project, scaffolding from the template, configuring site metadata, deploying to Cloudflare, or authoring interconnected note content.
---

# Setting Up an Infinity Notes Project

## Overview

Infinity Notes runs as three packages:

- **note-processor** — Pure logic for parsing, linking, and hydrating notes (no I/O)
- **worker** — Hono server on Cloudflare Workers, reads/writes markdown in R2
- **frontend** — Vite React SPA served via Cloudflare Pages

The CLI (`create-infinity-notes`) scaffolds two things:

1. **Platform** — The full worker + frontend monorepo (first-time infrastructure setup)
2. **Book** — A content directory with metadata, starter notes, and an upload script

Notes are organized into two optional subdirectories under `notes/`:
- **`concepts/`** — atomic, reusable knowledge entries (definitions, terms, mechanisms)
- **`threads/`** — hierarchical argument/theme notes that reference concepts and form a tree

Flat notes in `notes/` root (like `Welcome.md` and `About.md`) work as standalone entries.

---

## Scaffolding

### Scaffold a platform

```bash
npx create-infinity-notes platform
```

**Interactive prompts:**

```
? Platform name: my-infinity-notes
? Cloudflare R2 bucket name: infinity-notes
? R2 key prefix (default: books): books
? Domain for the frontend (optional): notes.example.com
? Domain for the worker API (optional): api.notes.example.com
```

**Output:**

```
my-infinity-notes/
  package.json                     # Workspace root
  README.md
  worker/
    src/
      index.ts                     # Hono app with all routes
      routes/
        books.ts
        previews.ts
        notes.ts
        concepts.ts
        rebuild.ts
        upload.ts
      storage/
        r2.ts                      # r2Key() helper, R2 read/write/list
      indexer.ts
      middleware/
        auth.ts
      types.ts
    wrangler.toml
    package.json
    tsconfig.json
  frontend/
    src/
      main.tsx
      router.tsx
      api/
        client.ts
        cache.ts
      components/
        layout.tsx
        header.tsx
        notes.tsx
        notes-browser.tsx
        notes-browser-item.tsx
        notes-fallback.tsx
        note-markdown.tsx
        note-backlink.tsx
        note-preview.tsx
        note-preview-popover.tsx
        note-links.tsx
        thread-breadcrumb.tsx
        concept-dictionary.tsx
        concept-dictionary-helpers.ts
        portal-body.tsx
        book-selector.tsx
        book-home.tsx
      helpers/
        markdown.tsx
        array.ts
        screen-size.ts
      pages/
        home.tsx
        book.tsx
        note.tsx
    index.html
    vite.config.ts
    tailwind.config.js
    postcss.config.js
    package.json
    tsconfig.json
```

### Scaffold a book

```bash
npx create-infinity-notes book
```

**Interactive prompts:**

```
? Book ID (url-friendly): surfaces-and-essences
? Book title: Surfaces and Essences
? Authors (comma-separated): Douglas Hofstadter, Emmanuel Sander
? Description: Analogy as the fuel and fire of thinking
? API URL for your platform: https://api.notes.example.com
```

**Output:**

```
surfaces-and-essences/
  meta.json
  notes/
    Welcome.md
    About.md
    concepts/
      .gitkeep
    threads/
      .gitkeep
  upload.sh
  README.md
```

### Scaffold a book translation

```bash
npx create-infinity-notes book --lang ko
```

**Interactive prompts:**

```
? Book ID (must match existing book): surfaces-and-essences
? Language code (e.g., ko, ja, fr): ko
? Book title in this language: 표면과 본질
? Description in this language: 사고의 연료이자 불꽃인 유추
? API URL for your platform: https://api.notes.example.com
```

**Output:**

```
surfaces-and-essences-ko/
  notes/
    Welcome.md
    About.md
    concepts/
      .gitkeep
    threads/
      .gitkeep
  upload.sh                        # Pre-configured with LANG=ko
```

No `meta.json` is created — the language entry is added to the existing book's
`meta.json` via the API or manually.

### No subcommand

Running `npx create-infinity-notes` without a subcommand prompts for a choice:

```
Welcome to create-infinity-notes!

? What would you like to create?
  > platform  — Deploy the full infinity-notes infrastructure
    book      — Create a new book for an existing platform
```

---

## Placeholder Tokens

### Platform tokens

| Token | Where it appears | Source |
|---|---|---|
| `__PLATFORM_NAME__` | Root `package.json` name | Platform name prompt |
| `__R2_BUCKET__` | `wrangler.toml` bucket_name | Bucket name prompt |
| `__R2_PREFIX__` | `wrangler.toml` R2_PREFIX var | R2 prefix prompt (default: `books`) |
| `__FRONTEND_DOMAIN__` | `wrangler.toml` routes (if provided) | Frontend domain prompt |
| `__API_DOMAIN__` | `vite.config.ts` proxy target, `client.ts` API_BASE | API domain prompt |

### Book tokens

| Token | Where it appears | Source |
|---|---|---|
| `__BOOK_ID__` | `meta.json` id, `upload.sh` BOOK_ID | Book ID prompt |
| `__BOOK_TITLE__` | `meta.json` title, `Welcome.md` title/content, `About.md` | Book title prompt |
| `__BOOK_AUTHORS__` | `meta.json` authors array, `Welcome.md`, `About.md` | Authors prompt |
| `__BOOK_DESCRIPTION__` | `meta.json` description | Description prompt |
| `__API_URL__` | `upload.sh` API_URL default | API URL prompt |

### Verify interpolation

```bash
# Platform
grep -r "__PLATFORM_NAME__\|__R2_BUCKET__\|__R2_PREFIX__\|__FRONTEND_DOMAIN__\|__API_DOMAIN__" \
  my-infinity-notes/ && echo "FAIL: placeholders remain" || echo "PASS"

# Book
grep -r "__BOOK_ID__\|__BOOK_TITLE__\|__BOOK_AUTHORS__\|__BOOK_DESCRIPTION__\|__API_URL__" \
  surfaces-and-essences/ && echo "FAIL: placeholders remain" || echo "PASS"
```

---

## After Scaffolding

### Platform

```bash
cd my-infinity-notes && npm install
cd worker && wrangler secret put API_TOKEN
cd worker && wrangler deploy
cd frontend && npm run build    # Deploy dist/ to Cloudflare Pages
```

### Book

Replace the starter notes (`Welcome.md`, `About.md`) with real content. The
homepage is always `Welcome.md` (resolved as `NOTE_INDEX_NAME = 'Welcome'`).

The `concepts/` and `threads/` directories are already created. Write notes
there following the format below, then upload:

```bash
API_TOKEN=your-token bash upload.sh
```

---

## meta.json

### Monolingual book

```json
{
  "id": "surfaces-and-essences",
  "title": "Surfaces and Essences",
  "authors": ["Douglas Hofstadter", "Emmanuel Sander"],
  "description": "Analogy as the fuel and fire of thinking"
}
```

### Multilingual book

```json
{
  "id": "surfaces-and-essences",
  "authors": ["Douglas Hofstadter", "Emmanuel Sander"],
  "defaultLanguage": "en",
  "languages": {
    "en": {
      "title": "Surfaces and Essences",
      "description": "Analogy as the fuel and fire of thinking"
    },
    "ko": {
      "title": "표면과 본질",
      "description": "사고의 연료이자 불꽃인 유추"
    }
  }
}
```

- `languages` absent → monolingual book, no language routing
- `defaultLanguage` required when `languages` is present
- Top-level `title`/`description` removed when `languages` is present
- Each language entry requires at least `title`

---

## R2 Storage Layout

All keys are prefixed with `R2_PREFIX` (default: `"books"`).

### Monolingual

```
{prefix}/{bookId}/meta.json
{prefix}/{bookId}/notes/Welcome.md
{prefix}/{bookId}/notes/concepts/Analogy.md
{prefix}/{bookId}/notes/threads/Root.md
{prefix}/{bookId}/_previews.json
{prefix}/{bookId}/_notes/Welcome.json
{prefix}/{bookId}/_notes/concepts/Analogy.json
{prefix}/_catalog.json
```

### Multilingual

```
{prefix}/{bookId}/meta.json
{prefix}/{bookId}/en/notes/Welcome.md
{prefix}/{bookId}/en/notes/concepts/Analogy.md
{prefix}/{bookId}/en/_previews.json
{prefix}/{bookId}/en/_notes/Welcome.json
{prefix}/{bookId}/ko/notes/Welcome.md
{prefix}/{bookId}/ko/_previews.json
{prefix}/{bookId}/ko/_notes/Welcome.json
{prefix}/_catalog.json
```

Each language subtree is structurally identical to a monolingual book. The
indexer rebuilds each language independently.

---

## Content Upload

### upload.sh (generated by book scaffold)

The upload script uses the Worker's HTTP API with bearer token auth:

```bash
API_TOKEN=your-token bash upload.sh
```

The script:
1. Uploads `meta.json` via `PUT /api/books/:bookId/meta`
2. Uploads each `.md` file via `PUT /api/books/:bookId/notes/:path`
3. Triggers `POST /api/books/:bookId/rebuild` to recompute the index

For translations, the generated `upload.sh` includes `LANG=ko` and passes
`?lang=ko` to all API calls.

### API endpoints (write, auth required)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/books` | Create a book |
| `DELETE` | `/api/books/:bookId` | Delete a book and all content |
| `PUT` | `/api/books/:bookId/meta` | Update book metadata |
| `PUT` | `/api/books/:bookId/notes/:path` | Upload/update a note |
| `DELETE` | `/api/books/:bookId/notes/:path` | Delete a note |
| `POST` | `/api/books/:bookId/upload` | Batch upload notes |
| `POST` | `/api/books/:bookId/sync` | Batch upload + rebuild |
| `POST` | `/api/books/:bookId/rebuild` | Rebuild the pre-computed index |

### API endpoints (read, public)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/books` | List all books |
| `GET` | `/api/books/:bookId/previews` | All note previews for a book |
| `GET` | `/api/books/:bookId/note/:path` | Single hydrated note |
| `GET` | `/api/books/:bookId/concepts` | Concept previews only |
| `GET` | `/api/books/:bookId/notes/:path/raw` | Raw markdown of a note |

All read endpoints accept `?lang=` for multilingual books. Omitting it uses the
default language. If a note doesn't exist in the requested language, the API
falls back to the default language and indicates this via response headers.

---

## Book Directory Structure

```
my-book/
├── meta.json                    # Book metadata (id, title, authors, description)
├── notes/
│   ├── Welcome.md               # Entry point (homepage, always required)
│   ├── About.md                 # Site info, navigation guide
│   ├── concepts/                # Atomic knowledge entries
│   │   ├── Some-Concept.md
│   │   └── ...
│   └── threads/                 # Hierarchical argument notes
│       ├── Root-Argument.md
│       ├── Sub-Argument.md
│       └── ...
├── upload.sh                    # Upload to platform and rebuild
└── README.md
```

Notes at any level are discovered recursively. Subdirectories are optional — a
book with all notes in the root works fine.

---

## Note Format

### Basic note (flat or in any subdirectory)

```markdown
---
title: Display Title        # optional — defaults to filename
snippet: One-line preview   # optional — auto-generated if omitted
---

# Heading

Body content. Link to other notes with [[Note Name]].
```

### Concept note (`notes/concepts/`)

```markdown
---
title: Concept Name
snippet: One-line description for hover previews and the concept dictionary
type: concept
source_chapter: [1, 3]      # optional — chapter indices in source material
---

# Concept Name

Synthesis paragraph explaining the concept in 2-4 self-contained sentences.

## Key Examples

> Quoted passage from the source
>
> — Chapter 1, "Section Name"

## Why It Matters

How this connects to other ideas. [[Other Concept]] and [[Some Thread]].

## Source References

- Chapter 1: "Section" — primary discussion
- Chapter 3: "Section" — extended examples
```

### Thread note (`notes/threads/`)

```markdown
---
title: Thread Name
snippet: One-line summary of the argument
type: thread
parent: Parent Thread Name   # optional — omit for root threads
source_chapter: [2]          # optional — chapter indices in source material
---

# Thread Name

Opening claim: one sentence stating the argument.

## The Argument

1. First supporting point. Illustrated by [[Some Concept]]...
2. Second point...

## Sub-threads

- [[Child Thread A]]
- [[Child Thread B]]

## Source References

- Chapter 2: "Section" — primary
```

### Frontmatter Field Reference

| Field | Applies to | Required | Description |
|---|---|---|---|
| `title` | all | no | Display title. Defaults to filename. |
| `snippet` | all | no | One-line preview for hover tooltips and dictionary. Auto-generated if omitted. |
| `type` | concept, thread | no | `'concept'` or `'thread'`. Enables type-specific UI (dictionary, breadcrumbs, badge). |
| `parent` | thread | no | Name of the parent thread. Omit for root-level threads. Renders as a breadcrumb trail. |
| `source_chapter` | concept, thread | no | Array of chapter indices referencing the source material. |

**Snippet auto-generation:** strips all heading lines, takes first 2 non-empty lines. Put your most descriptive content first if you skip the `snippet` field.

---

## Linking

**Backlink syntax:** `[[Note Name]]` — case-sensitive, must match the `.md` filename exactly (without extension or subdirectory path).

**Flat resolution:** Authors write `[[Zeugma]]`, not `[[concepts/Zeugma]]`. The framework resolves short names to the correct file across all subdirectories. Note names must be unique across the entire `notes/` tree.

A note automatically appears in the "Links to this note" section of every note it references.

### When to link

- **Concept → concept:** when understanding one requires understanding the other
- **Thread → concept:** when the argument invokes that concept as a key part of its reasoning
- **Thread → child thread:** in the "Sub-threads" section, to encode the argument hierarchy
- **Do not link** for passing mentions or loose thematic association — links should earn their place

---

## UI Features

### Concept Dictionary
A collapsible A-Z dictionary of all concept notes appears at the bottom of every page. Collapsed by default. Clicking a letter expands that letter's concepts (accordion-style). Each entry shows the concept title and snippet.

### Thread Breadcrumbs
Thread notes with a `parent` field display a breadcrumb trail above the title: `Root > Parent > Current`. Each ancestor is clickable and stacks the parent note in the browser.

### Note Type Badge
Notes with a `type` field display a subtle badge ("concept" or "thread") near the title for orientation.

### Language Selector
Multilingual books show a language toggle in the header (e.g., `[EN] [KO]`). Switching languages re-fetches content for the current note. If a note isn't translated, the default language is shown with a "not yet translated" indicator.

### Multi-Book Selector
The frontend home page lists all available books. Each book card shows title, authors, and note count.

---

## Frontend URL Structure

```
/                                              # Book selector
/books/surfaces-and-essences                   # Welcome note (default language)
/books/surfaces-and-essences?lang=ko           # Welcome note (Korean)
/books/surfaces-and-essences/concepts/Zeugma   # Specific note
/books/surfaces-and-essences/concepts/Zeugma?stacked=threads/Words  # Stacked
```

---

## Local Development

```bash
# Terminal 1: Start the Hono worker locally
cd packages/worker && wrangler dev

# Terminal 2: Start the Vite frontend (proxies /api to localhost:8787)
cd packages/frontend && npm run dev

# Terminal 3: Upload notes and rebuild
cd my-book && API_URL=http://localhost:8787 API_TOKEN=dev-token bash upload.sh
```

---

## Note Authoring Checklist

- [ ] `Welcome.md` exists (homepage) and links into the rest of the content
- [ ] `meta.json` contains correct id, title, authors, description
- [ ] Every note links to at least one other note with `[[Name]]`
- [ ] Filenames are human-readable (they become URL paths)
- [ ] Note names are unique across all subdirectories
- [ ] No leftover placeholder tokens (`__BOOK_TITLE__` etc.) anywhere in `notes/`
- [ ] Every concept note has `type: concept` in frontmatter
- [ ] Every thread note has `type: thread` in frontmatter
- [ ] Every non-root thread note has a valid `parent` field pointing to an existing thread
- [ ] Thread hierarchy has a single root (a thread with no parent)
- [ ] All `[[links]]` resolve to existing notes (no broken links)
- [ ] All snippets read well as standalone tooltip text
- [ ] No orphan notes — every note is reachable from Welcome through some chain of links
- [ ] For multilingual books: `meta.json` has `languages` and `defaultLanguage` fields
