import app from './index'
import {describe, expect, it} from 'vitest'

class FakeR2Object {
  constructor(private readonly value: string) {}

  async text() {
    return this.value
  }

  async json<T>() {
    return JSON.parse(this.value) as T
  }
}

class FakeR2Bucket {
  readonly objects = new Map<string, string>()
  readonly getCalls: string[] = []

  async get(key: string) {
    this.getCalls.push(key)
    const value = this.objects.get(key)
    return value === undefined ? null : new FakeR2Object(value)
  }

  async put(key: string, value: string | ReadableStream | ArrayBuffer) {
    if (typeof value !== 'string') throw new Error('FakeR2Bucket only supports strings')
    this.objects.set(key, value)
    return null
  }

  async list(options?: {prefix?: string; cursor?: string}) {
    const keys = [...this.objects.keys()]
      .filter((key) => key.startsWith(options?.prefix || ''))
      .sort()
    const cursor = options?.cursor ? Number(options.cursor) : 0
    const page = keys.slice(cursor, cursor + 2)
    const next = cursor + 2

    return {
      objects: page.map((key) => ({key})),
      truncated: next < keys.length,
      cursor: next < keys.length ? String(next) : undefined,
    }
  }
}

const seedBook = async (bucket: FakeR2Bucket) => {
  await bucket.put(
    'books/hofstadter/meta.json',
    JSON.stringify({
      id: 'hofstadter',
      title: 'Surfaces and Essences',
      authors: ['Douglas Hofstadter', 'Emmanuel Sander'],
      description: 'Analogy as the fuel and fire of thinking',
    }),
  )
  await bucket.put(
    'books/hofstadter/notes/Welcome.md',
    '# Welcome\n\nStart with [[Zeugma]] and [[Root Thread]].',
  )
  await bucket.put(
    'books/hofstadter/notes/concepts/Zeugma.md',
    `---
title: Zeugma
snippet: A word bridges unlike senses.
type: concept
---

# Zeugma
`,
  )
  await bucket.put(
    'books/hofstadter/notes/threads/Root Thread.md',
    `---
title: Root Thread
type: thread
---

# Root Thread

Use [[Zeugma]].
`,
  )
}

const request = (
  path: string,
  bucket: FakeR2Bucket,
  init?: RequestInit,
  env?: Partial<{R2_PREFIX: string; ALLOWED_ORIGINS: string}>,
) => {
  return app.request(`http://worker.test${path}`, init, {
    NOTES_BUCKET: bucket as unknown as R2Bucket,
    ...env,
  })
}

describe('worker API', () => {
  it('should rebuild a book into previews, hydrated notes, metadata, and catalog', async () => {
    const bucket = new FakeR2Bucket()
    await seedBook(bucket)

    const response = await request('/api/books/hofstadter/rebuild', bucket, {
      method: 'POST',
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      noteCount: 3,
    })

    const previews = JSON.parse(bucket.objects.get('books/hofstadter/_previews.json')!)
    expect(previews).toEqual([
      expect.objectContaining({path: 'Welcome'}),
      expect.objectContaining({path: 'concepts/Zeugma', type: 'concept'}),
      expect.objectContaining({path: 'threads/Root Thread', type: 'thread'}),
    ])
    expect(previews[0]).not.toHaveProperty('markdown')

    const note = JSON.parse(bucket.objects.get('books/hofstadter/_notes/concepts/Zeugma.json')!)
    expect(note.linkedFromNotes).toEqual([
      expect.objectContaining({path: 'threads/Root Thread'}),
    ])

    const meta = JSON.parse(bucket.objects.get('books/hofstadter/meta.json')!)
    expect(meta.noteCount).toBe(3)

    const catalog = JSON.parse(bucket.objects.get('books/_catalog.json')!)
    expect(catalog.books).toEqual([expect.objectContaining({id: 'hofstadter', noteCount: 3})])
  })

  it('should serve catalog, previews, concepts, and individual hydrated notes', async () => {
    const bucket = new FakeR2Bucket()
    await seedBook(bucket)
    await request('/api/books/hofstadter/rebuild', bucket, {method: 'POST'})

    await expect((await request('/api/books', bucket)).json()).resolves.toMatchObject({
      books: [expect.objectContaining({id: 'hofstadter'})],
    })
    await expect((await request('/api/books/hofstadter/previews', bucket)).json()).resolves.toHaveLength(3)
    await expect((await request('/api/books/hofstadter/concepts', bucket)).json()).resolves.toEqual([
      expect.objectContaining({path: 'concepts/Zeugma', type: 'concept'}),
    ])

    const noteResponse = await request(
      '/api/books/hofstadter/note/concepts%2FZeugma',
      bucket,
    )
    expect(noteResponse.status).toBe(200)
    await expect(noteResponse.json()).resolves.toMatchObject({
      path: 'concepts/Zeugma',
      type: 'concept',
    })
  })

  it('should resolve short note names through previews before reading hydrated notes', async () => {
    const bucket = new FakeR2Bucket()
    await seedBook(bucket)
    await request('/api/books/hofstadter/rebuild', bucket, {method: 'POST'})

    const conceptResponse = await request('/api/books/hofstadter/note/Zeugma', bucket)
    expect(conceptResponse.status).toBe(200)
    await expect(conceptResponse.json()).resolves.toMatchObject({
      path: 'concepts/Zeugma',
      type: 'concept',
    })

    const threadResponse = await request(
      '/api/books/hofstadter/note/Root%20Thread',
      bucket,
    )
    expect(threadResponse.status).toBe(200)
    await expect(threadResponse.json()).resolves.toMatchObject({
      path: 'threads/Root Thread',
      type: 'thread',
    })
  })

  it('should return 404 for missing notes', async () => {
    const bucket = new FakeR2Bucket()

    const response = await request('/api/books/hofstadter/note/Missing', bucket)

    expect(response.status).toBe(404)
  })

  it('should set cache and CORS headers on GET responses', async () => {
    const bucket = new FakeR2Bucket()
    await bucket.put('_catalog.json', JSON.stringify({books: []}))

    const response = await request('/api/books', bucket, {
      headers: {Origin: 'https://example.com'},
    })

    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=3600, s-maxage=86400',
    )
    expect(response.headers.get('access-control-allow-origin')).toBe('https://example.com')
  })

  it('should use R2_PREFIX for all rebuild and read operations', async () => {
    const bucket = new FakeR2Bucket()
    await bucket.put(
      'staging/books/hofstadter/meta.json',
      JSON.stringify({
        id: 'hofstadter',
        title: 'Surfaces and Essences',
        authors: [],
        description: 'Test',
      }),
    )
    await bucket.put('staging/books/hofstadter/notes/Welcome.md', '# Welcome')

    const response = await request('/api/books/hofstadter/rebuild', bucket, {
      method: 'POST',
    }, {R2_PREFIX: 'staging/books'})

    expect(response.status).toBe(200)
    expect(bucket.objects.has('staging/books/hofstadter/_previews.json')).toBe(true)
    expect(bucket.objects.has('staging/books/hofstadter/_notes/Welcome.json')).toBe(true)
    expect(bucket.objects.has('staging/books/_catalog.json')).toBe(true)

    const catalog = await request('/api/books', bucket, undefined, {
      R2_PREFIX: 'staging/books',
    })
    expect(catalog.status).toBe(200)
    await expect(catalog.json()).resolves.toMatchObject({
      books: [expect.objectContaining({id: 'hofstadter', noteCount: 1})],
    })
  })

  it('should isolate two Workers using different prefixes in the same bucket', async () => {
    const bucket = new FakeR2Bucket()
    await bucket.put(
      'staging/hofstadter/meta.json',
      JSON.stringify({id: 'hofstadter', title: 'Staging', authors: [], description: ''}),
    )
    await bucket.put('staging/hofstadter/notes/Welcome.md', '# Staging')
    await bucket.put(
      'prod/hofstadter/meta.json',
      JSON.stringify({id: 'hofstadter', title: 'Production', authors: [], description: ''}),
    )
    await bucket.put('prod/hofstadter/notes/Welcome.md', '# Production')

    await request('/api/books/hofstadter/rebuild', bucket, {method: 'POST'}, {
      R2_PREFIX: 'staging',
    })
    await request('/api/books/hofstadter/rebuild', bucket, {method: 'POST'}, {
      R2_PREFIX: 'prod',
    })

    const stagingCatalog = await request('/api/books', bucket, undefined, {
      R2_PREFIX: 'staging',
    })
    const prodCatalog = await request('/api/books', bucket, undefined, {
      R2_PREFIX: 'prod',
    })

    await expect(stagingCatalog.json()).resolves.toMatchObject({
      books: [expect.objectContaining({title: 'Staging'})],
    })
    await expect(prodCatalog.json()).resolves.toMatchObject({
      books: [expect.objectContaining({title: 'Production'})],
    })
  })
})
