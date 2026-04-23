import {describe, expect, it} from 'vitest'
import {buildConceptIndex} from './concept-dictionary-helpers'
import {NotePreview} from '../interfaces/note'

const concept = (title: string): NotePreview => ({
  path: `concepts/${title}`,
  title,
  snippet: `${title} snippet`,
  type: 'concept',
})

describe('buildConceptIndex', () => {
  it('should bucket Hangul concept titles by Korean initial consonant', () => {
    const index = buildConceptIndex([
      concept('개념적 혼성'),
      concept('레토리케'),
      concept('로고스'),
      concept('메타포라'),
      concept('범주화'),
      concept('생각의 도구'),
    ])

    expect(index.buckets.map((bucket) => bucket.label)).toEqual([
      'ㄱ',
      'ㄹ',
      'ㅁ',
      'ㅂ',
      'ㅅ',
    ])
    expect(index.buckets.find((bucket) => bucket.key === 'ㄹ')?.concepts).toEqual([
      expect.objectContaining({title: '레토리케'}),
      expect.objectContaining({title: '로고스'}),
    ])
  })

  it('should keep English and Korean buckets separate for mixed concept lists', () => {
    const index = buildConceptIndex([
      concept('Analogy'),
      concept('Category'),
      concept('개념적 혼성'),
      concept('로고스'),
    ])

    expect(index.buckets.map((bucket) => bucket.label)).toEqual([
      'ㄱ',
      'ㄹ',
      'A',
      'C',
    ])
  })
})
