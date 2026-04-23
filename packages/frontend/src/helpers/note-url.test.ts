import {describe, expect, it} from 'vitest'
import {noteStackUrl, singleNoteUrl} from './note-url'

describe('note URL helpers', () => {
  it('should encode nested note paths into route segments', () => {
    expect(singleNoteUrl('surfaces-and-essences', 'concepts/Zeugma')).toBe(
      '/books/surfaces-and-essences/concepts/Zeugma',
    )
  })

  it('should encode note stacks using stacked search params', () => {
    expect(
      noteStackUrl('surfaces-and-essences', [
        'Welcome',
        'threads/Analogy as the Core of Cognition',
        'concepts/Zeugma',
      ]),
    ).toBe(
      '/books/surfaces-and-essences/Welcome?stacked=threads%2FAnalogy+as+the+Core+of+Cognition&stacked=concepts%2FZeugma',
    )
  })
})
