import {BookMeta, buildBookIndex, parseNote} from '@infinity-notes/note-processor'
import {listAllKeys, r2Key, readJson, readText, writeJson} from './storage/r2'
import {Env} from './types'

export interface RebuildResult {
  noteCount: number
}

export const rebuildCatalog = async (env: Env): Promise<void> => {
  const keys = await listAllKeys(env.NOTES_BUCKET, `${r2Key(env)}/`)
  const metaKeys = keys.filter((key) => key.endsWith('/meta.json'))

  const books = (
    await Promise.all(metaKeys.map((key) => readJson<BookMeta>(env.NOTES_BUCKET, key)))
  )
    .filter((book): book is BookMeta => Boolean(book))
    .sort((a, b) => a.title.localeCompare(b.title))

  await writeJson(env.NOTES_BUCKET, r2Key(env, '_catalog.json'), {books})
}

export const rebuildBook = async (
  env: Env,
  bookId: string,
): Promise<RebuildResult> => {
  const bucket = env.NOTES_BUCKET
  const prefix = `${r2Key(env, bookId, 'notes')}/`
  const keys = await listAllKeys(bucket, prefix)
  const markdownKeys = keys.filter((key) => key.endsWith('.md'))

  const noteEntries = (
    await Promise.all(
      markdownKeys.map(async (key) => {
        const content = await readText(bucket, key)
        if (!content) return null

        return {
          path: decodeURIComponent(key.replace(prefix, '').replace(/\.md$/, '')),
          content,
        }
      }),
    )
  ).filter((entry): entry is {path: string; content: string} => Boolean(entry))

  const rawNotes = noteEntries.map((entry) => parseNote(entry.path, entry.content))
  const index = buildBookIndex(rawNotes)

  await writeJson(bucket, r2Key(env, bookId, '_previews.json'), index.previews)
  await Promise.all(
    Object.entries(index.notes).map(([notePath, note]) =>
      writeJson(bucket, r2Key(env, bookId, '_notes', `${notePath}.json`), note),
    ),
  )

  const meta = await readJson<Omit<BookMeta, 'noteCount'> & {noteCount?: number}>(
    bucket,
    r2Key(env, bookId, 'meta.json'),
  )

  if (meta) {
    await writeJson(bucket, r2Key(env, bookId, 'meta.json'), {
      ...meta,
      noteCount: rawNotes.length,
    })
  }

  await rebuildCatalog(env)

  return {noteCount: rawNotes.length}
}
