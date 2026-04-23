import {BookMeta, Note, NotePreview} from '@infinity-notes/note-processor'

const PRODUCTION_API_BASE = 'https://infinity-notes-api.dev-726.workers.dev/api'

export const resolveApiBase = (
  env: Pick<ImportMetaEnv, 'PROD'> & Partial<Pick<ImportMetaEnv, 'VITE_API_URL'>>,
): string => {
  if (env.VITE_API_URL) return env.VITE_API_URL.replace(/\/+$/, '')
  return env.PROD ? PRODUCTION_API_BASE : '/api'
}

const API_BASE = resolveApiBase(import.meta.env)

const requireOk = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response
}

export const fetchBooks = async (): Promise<BookMeta[]> => {
  const response = await requireOk(await fetch(`${API_BASE}/books`))
  const data = (await response.json()) as {books: BookMeta[]}
  return data.books
}

export const fetchPreviews = async (bookId: string): Promise<NotePreview[]> => {
  const response = await requireOk(await fetch(`${API_BASE}/books/${bookId}/previews`))
  return (await response.json()) as NotePreview[]
}

export const fetchNote = async (
  bookId: string,
  notePath: string,
): Promise<Note | null> => {
  const response = await fetch(
    `${API_BASE}/books/${bookId}/note/${encodeURIComponent(notePath)}`,
  )

  if (response.status === 404) return null

  return (await requireOk(response).then((res) => res.json())) as Note
}

export const fetchConcepts = async (bookId: string): Promise<NotePreview[]> => {
  const response = await requireOk(await fetch(`${API_BASE}/books/${bookId}/concepts`))
  return (await response.json()) as NotePreview[]
}
