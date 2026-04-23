import {afterEach, describe, expect, it, vi} from 'vitest'
import {
  fetchBooks,
  fetchConcepts,
  fetchNote,
  fetchPreviews,
  resolveApiBase,
} from './client'

describe('api client', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch books from the Worker API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ok: true, json: async () => ({books: [{id: 'book'}]})}),
    )

    await expect(fetchBooks()).resolves.toEqual([{id: 'book'}])
    expect(fetch).toHaveBeenCalledWith('/api/books')
  })

  it('should use the remote Worker API by default in production', () => {
    expect(resolveApiBase({PROD: true})).toBe(
      'https://infinity-notes-api.dev-726.workers.dev/api',
    )
  })

  it('should keep the local API proxy in development', () => {
    expect(resolveApiBase({PROD: false})).toBe('/api')
  })

  it('should URL-encode note paths when fetching a note', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({path: 'concepts/Zeugma'}),
      }),
    )

    await expect(fetchNote('hofstadter', 'concepts/Zeugma')).resolves.toEqual({
      path: 'concepts/Zeugma',
    })
    expect(fetch).toHaveBeenCalledWith(
      '/api/books/hofstadter/note/concepts%2FZeugma',
    )
  })

  it('should return null for missing notes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({status: 404, ok: false}))

    await expect(fetchNote('hofstadter', 'Missing')).resolves.toBeNull()
  })

  it('should fetch previews and concepts for a book', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ok: true, json: async () => [{path: 'Welcome'}]})
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{path: 'concepts/Zeugma'}],
      })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchPreviews('hofstadter')).resolves.toEqual([{path: 'Welcome'}])
    await expect(fetchConcepts('hofstadter')).resolves.toEqual([
      {path: 'concepts/Zeugma'},
    ])
  })
})
