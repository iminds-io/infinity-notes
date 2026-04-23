import {
  backlinkNames,
  buildBookIndex,
  getBreadcrumbChain,
  getConceptPreviews,
  hydrateNote,
  parseNote,
  resolveNotePath,
} from './index'
import {describe, expect, it, vi} from 'vitest'

describe('parseNote', () => {
  it('should parse all book note frontmatter fields', () => {
    const note = parseNote(
      'concepts/Zeugma',
      `---
title: Zeugma
snippet: A word bridges unlike senses.
type: concept
source_chapter: [0, 1]
---

# Zeugma

The concept body.
`,
    )

    expect(note).toMatchObject({
      path: 'concepts/Zeugma',
      title: 'Zeugma',
      snippet: 'A word bridges unlike senses.',
      type: 'concept',
      sourceChapter: [0, 1],
      markdown: '# Zeugma\n\nThe concept body.\n',
      linkedFromNotes: [],
    })
  })

  it('should generate a snippet from non-heading body text when frontmatter omits it', () => {
    const note = parseNote(
      'threads/Root',
      `---
title: Root
type: thread
parent: Parent Thread
---

# Root

First useful sentence.

Second useful sentence.
`,
    )

    expect(note.snippet).toBe('First useful sentence. Second useful sentence.')
    expect(note.parent).toBe('Parent Thread')
  })

  it('should omit undefined optional fields so notes serialize through JSON', () => {
    const note = parseNote('Welcome', '# Welcome\n\nStart here.')

    expect(JSON.stringify(note)).toBe(
      '{"path":"Welcome","title":"Welcome","snippet":"Start here.","markdown":"# Welcome\\n\\nStart here.","linkedFromNotes":[]}',
    )
  })
})

describe('link resolution', () => {
  const notes = [
    parseNote('Welcome', '# Welcome'),
    parseNote('concepts/Zeugma', '# Zeugma'),
    parseNote('threads/Zeugma', '# Thread Zeugma'),
  ]

  it('should resolve exact paths before basename matches', () => {
    expect(resolveNotePath('concepts/Zeugma', notes)).toBe('concepts/Zeugma')
  })

  it('should resolve unique basenames across subdirectories', () => {
    expect(resolveNotePath('Welcome', notes)).toBe('Welcome')
  })

  it('should warn and return first path for ambiguous basename matches', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(resolveNotePath('Zeugma', notes)).toBe('concepts/Zeugma')
    expect(warn).toHaveBeenCalledWith(
      'Ambiguous link "Zeugma" matches: concepts/Zeugma, threads/Zeugma',
    )
  })

  it('should return null for missing links', () => {
    expect(resolveNotePath('Missing', notes)).toBeNull()
  })
})

describe('backlinkNames', () => {
  it('should extract all wiki-style links from markdown', () => {
    expect(backlinkNames('Read [[Analogy]] and [[concepts/Zeugma]].')).toEqual([
      'Analogy',
      'concepts/Zeugma',
    ])
  })
})

describe('hydration', () => {
  const notes = [
    parseNote('Welcome', '# Welcome\n\nStart at [[Zeugma]].'),
    parseNote(
      'concepts/Zeugma',
      `---
title: Zeugma
type: concept
---

# Zeugma
`,
    ),
    parseNote(
      'threads/Root',
      `---
title: Root
type: thread
---

# Root

Use [[Zeugma]].
`,
    ),
    parseNote(
      'threads/Child',
      `---
title: Child
type: thread
parent: Root
---

# Child
`,
    ),
  ]

  it('should hydrate backlinks while excluding Welcome backlinks', () => {
    const note = hydrateNote(notes[1], notes)

    expect(note.linkedFromNotes).toEqual([
      expect.objectContaining({path: 'threads/Root', type: 'thread'}),
    ])
  })

  it('should build root-to-parent breadcrumbs', () => {
    expect(getBreadcrumbChain(notes[3], notes)).toEqual([
      expect.objectContaining({path: 'threads/Root', type: 'thread'}),
    ])
  })

  it('should return sorted concept previews', () => {
    expect(getConceptPreviews(notes)).toEqual([
      expect.objectContaining({path: 'concepts/Zeugma', type: 'concept'}),
    ])
  })
})

describe('buildBookIndex', () => {
  it('should build two-tier previews, hydrated notes, concepts, and adjacency graph', () => {
    const notes = [
      parseNote('Welcome', '# Welcome\n\nStart with [[Zeugma]].'),
      parseNote(
        'concepts/Zeugma',
        `---
title: Zeugma
snippet: A word bridges unlike senses.
type: concept
---

# Zeugma
`,
      ),
      parseNote(
        'threads/Words',
        `---
title: Words
type: thread
---

# Words

Use [[Zeugma]].
`,
      ),
    ]

    const index = buildBookIndex(notes)

    expect(index.previews).toEqual([
      expect.objectContaining({path: 'Welcome'}),
      expect.objectContaining({path: 'concepts/Zeugma', type: 'concept'}),
      expect.objectContaining({path: 'threads/Words', type: 'thread'}),
    ])
    expect(index.previews[0]).not.toHaveProperty('markdown')
    expect(index.concepts).toEqual([
      expect.objectContaining({path: 'concepts/Zeugma', type: 'concept'}),
    ])
    expect(index.notes['concepts/Zeugma'].linkedFromNotes).toEqual([
      expect.objectContaining({path: 'threads/Words'}),
    ])
    expect(index.graph).toEqual({
      Welcome: ['concepts/Zeugma'],
      'concepts/Zeugma': [],
      'threads/Words': ['concepts/Zeugma'],
    })
  })
})
