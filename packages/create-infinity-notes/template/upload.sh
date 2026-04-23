#!/bin/bash
set -euo pipefail

BOOK_ID="${1:-__BOOK_ID__}"
BUCKET="${INFINITY_NOTES_BUCKET:-infinity-notes}"
R2_PREFIX="${INFINITY_NOTES_R2_PREFIX:-__R2_PREFIX__}"
WORKER_URL="${INFINITY_NOTES_WORKER_URL:-https://your-worker.workers.dev}"

echo "Uploading meta.json to R2..."
wrangler r2 object put --remote "$BUCKET/$R2_PREFIX/$BOOK_ID/meta.json" --file meta.json

echo "Uploading markdown notes to R2..."
find notes -name '*.md' | while read -r file; do
  key="$R2_PREFIX/$BOOK_ID/$file"
  wrangler r2 object put --remote "$BUCKET/$key" --file "$file"
done

echo "Triggering rebuild..."
curl -X POST "$WORKER_URL/api/books/$BOOK_ID/rebuild"

echo "Done."
