import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {NotePreview, resolveNotePath} from '@infinity-notes/note-processor'
import {rebuildBook} from './indexer'
import {r2Key, readJson} from './storage/r2'
import {Env} from './types'

const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
}

const app = new Hono<{Bindings: Env}>()

app.use(
  '/api/*',
  cors({
    origin: (origin, c) => {
      const allowed = c.env.ALLOWED_ORIGINS?.split(',') || ['*']
      if (allowed.includes('*')) return origin || '*'
      return origin && allowed.includes(origin) ? origin : ''
    },
  }),
)

app.get('/api/books', async (c) => {
  const catalog = await readJson(c.env.NOTES_BUCKET, r2Key(c.env, '_catalog.json'))
  if (!catalog) return c.json({books: []}, 200, cacheHeaders)

  return c.json(catalog, 200, cacheHeaders)
})

app.get('/api/books/:bookId/previews', async (c) => {
  const bookId = c.req.param('bookId')
  const previews = await readJson(
    c.env.NOTES_BUCKET,
    r2Key(c.env, bookId, '_previews.json'),
  )
  if (!previews) return c.json({error: {message: 'unknown book'}}, 404)

  return c.json(previews, 200, cacheHeaders)
})

app.get('/api/books/:bookId/concepts', async (c) => {
  const bookId = c.req.param('bookId')
  const previews = await readJson<NotePreview[]>(
    c.env.NOTES_BUCKET,
    r2Key(c.env, bookId, '_previews.json'),
  )
  if (!previews) return c.json({error: {message: 'unknown book'}}, 404)

  const concepts = previews
    .filter((preview) => preview.type === 'concept')
    .sort((a, b) => a.title.localeCompare(b.title))

  return c.json(concepts, 200, cacheHeaders)
})

app.get('/api/books/:bookId/note/*', async (c) => {
  const bookId = c.req.param('bookId')
  const prefix = `/api/books/${bookId}/note/`
  const notePath = decodeURIComponent(new URL(c.req.url).pathname.slice(prefix.length))
  const exactNote = await readJson(
    c.env.NOTES_BUCKET,
    r2Key(c.env, bookId, '_notes', `${notePath}.json`),
  )

  if (exactNote) return c.json(exactNote, 200, cacheHeaders)

  const previews = await readJson<NotePreview[]>(
    c.env.NOTES_BUCKET,
    r2Key(c.env, bookId, '_previews.json'),
  )
  const resolvedPath = previews ? resolveNotePath(notePath, previews) : null
  const resolvedNote = resolvedPath
    ? await readJson(
        c.env.NOTES_BUCKET,
        r2Key(c.env, bookId, '_notes', `${resolvedPath}.json`),
      )
    : null

  if (!resolvedNote) return c.json({error: {message: 'unknown note'}}, 404)

  return c.json(resolvedNote, 200, cacheHeaders)
})

app.post('/api/books/:bookId/rebuild', async (c) => {
  const started = Date.now()
  const {noteCount} = await rebuildBook(c.env, c.req.param('bookId'))

  return c.json({
    success: true,
    noteCount,
    duration: `${Date.now() - started}ms`,
  })
})

export default app
