# __BOOK_TITLE__

This directory contains content for the shared Infinity Notes Vite + Hono + R2 deployment.

## Structure

- `meta.json` - book metadata used by the catalog
- `notes/Welcome.md` - entry point
- `notes/About.md` - source and navigation guide
- `notes/concepts/` - concept notes
- `notes/threads/` - argument thread notes
- `upload.sh` - uploads content to R2 and triggers rebuild

## Upload

```bash
./upload.sh __BOOK_ID__
```

Set `INFINITY_NOTES_BUCKET`, `INFINITY_NOTES_R2_PREFIX`, and
`INFINITY_NOTES_WORKER_URL` to override the defaults.
