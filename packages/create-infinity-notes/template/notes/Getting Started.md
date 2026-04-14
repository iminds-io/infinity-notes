---
title: Getting Started
---

# Getting Started

## Adding Notes

Create a new `.md` file in the `notes/` directory. The filename becomes the URL path and the link target.

## Linking Between Notes

Use double brackets to create links: `[[Note Name]]`. The text between brackets must match a filename exactly (without the `.md` extension).

When you link to a note, that note's "Links to this note" section will automatically show a backlink.

## Frontmatter

Each note can have optional YAML frontmatter:

```yaml
---
title: Display Title
snippet: Custom preview text for hover tooltips
---
```

If omitted, the title defaults to the filename and the snippet is auto-generated from the first two lines of content.

## Features

- **Horizontal stacking** — On desktop, clicking a link opens the note in a new column to the right
- **Hover previews** — Hovering over a link shows a tooltip with the note's snippet
- **Backlinks** — Notes that reference another note are listed in its "Links to this note" section
- **Responsive** — Mobile devices get a single-column view with standard page navigation

See also: [[Example Note]]
