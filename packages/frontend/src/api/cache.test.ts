import {afterEach, describe, expect, it, vi} from 'vitest'
import {clearCaches, getCachedNote, getCachedPreviews} from './cache'
import * as client from './client'

describe('api cache', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    clearCaches()
  })

  it('should fetch previews once per book', async () => {
    const fetchPreviews = vi
      .spyOn(client, 'fetchPreviews')
      .mockResolvedValue([{path: 'Welcome', title: 'Welcome', snippet: ''}])

    await getCachedPreviews('hofstadter')
    await getCachedPreviews('hofstadter')

    expect(fetchPreviews).toHaveBeenCalledTimes(1)
  })

  it('should cache fetched notes per book and path', async () => {
    const fetchNote = vi.spyOn(client, 'fetchNote').mockResolvedValue({
      path: 'Welcome',
      title: 'Welcome',
      snippet: '',
      markdown: '# Welcome',
      linkedFromNotes: [],
    })

    await getCachedNote('hofstadter', 'Welcome')
    await getCachedNote('hofstadter', 'Welcome')

    expect(fetchNote).toHaveBeenCalledTimes(1)
  })
})
