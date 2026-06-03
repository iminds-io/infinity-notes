// ABOUTME: Tests for feed-helpers: year parsing, search match, daily pick, kindred relation.
// ABOUTME: Pinned dates and seeded book sets verify deterministic browse behaviour.

import {describe, expect, it} from 'vitest'
import {dailyBook, feedRelated, matchScore, yearNum} from './feed-helpers'
import type {EnrichedBook} from './book-enrichment'

const mkBook = (over: Partial<EnrichedBook>): EnrichedBook => ({
  id: 'x',
  title: 'X',
  authors: ['Anon'],
  description: '',
  noteCount: 0,
  cluster: 'stoic',
  clusterName: 'Stoicism',
  essence: '',
  synthesis: '',
  year: '',
  kindred: [],
  ...over,
})

describe('yearNum', () => {
  it('parses CE numerals', () => {
    expect(yearNum('2011')).toBe(2011)
    expect(yearNum('c.180')).toBe(180)
    expect(yearNum('1532')).toBe(1532)
  })

  it('parses BCE as negative', () => {
    expect(yearNum('c.500 BCE')).toBe(-500)
    expect(yearNum('c.300 BCE')).toBe(-300)
  })

  it('returns 0 for empty or unparseable', () => {
    expect(yearNum('')).toBe(0)
    expect(yearNum('—')).toBe(0)
  })
})

describe('matchScore', () => {
  const book = mkBook({
    id: 'meditations',
    title: 'Meditations',
    authors: ['Marcus Aurelius'],
    essence: 'You only control your response.',
    synthesis: 'An emperor\'s notebook on tranquility.',
    clusterName: 'Stoicism & Self-Mastery',
  })

  it('matches across title, author, essence, synthesis, cluster', () => {
    expect(matchScore(book, 'meditations')).toBe(true)
    expect(matchScore(book, 'aurelius')).toBe(true)
    expect(matchScore(book, 'tranquility')).toBe(true)
    expect(matchScore(book, 'stoicism')).toBe(true)
  })

  it('requires every whitespace-split term to match', () => {
    expect(matchScore(book, 'marcus stoicism')).toBe(true)
    expect(matchScore(book, 'marcus nope')).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(matchScore(book, 'MARCUS')).toBe(true)
  })

  it('returns false when query is empty', () => {
    expect(matchScore(book, '')).toBe(false)
    expect(matchScore(book, '   ')).toBe(false)
  })
})

describe('dailyBook', () => {
  const books = [
    mkBook({id: 'a'}),
    mkBook({id: 'b'}),
    mkBook({id: 'c'}),
    mkBook({id: 'd'}),
  ]

  it('is deterministic for the same calendar day', () => {
    const date = new Date('2026-06-03T00:00:00Z')
    expect(dailyBook(books, date)?.id).toBe(dailyBook(books, date)?.id)
  })

  it('rotates by day-of-year', () => {
    const day1 = new Date('2026-01-02T00:00:00Z')
    const day2 = new Date('2026-01-03T00:00:00Z')
    expect(dailyBook(books, day1)?.id).not.toBe(dailyBook(books, day2)?.id)
  })

  it('returns null when no books are available', () => {
    expect(dailyBook([], new Date())).toBeNull()
  })
})

describe('feedRelated', () => {
  const all = [
    mkBook({id: 'meditations', cluster: 'stoic', kindred: ['frankl']}),
    mkBook({id: 'seneca', cluster: 'stoic'}),
    mkBook({id: 'epictetus', cluster: 'stoic'}),
    mkBook({id: 'frankl', cluster: 'exist'}),
    mkBook({id: 'sisyphus', cluster: 'exist'}),
  ]

  it('returns kindred first, then same-cluster siblings', () => {
    const me = all[0]
    const related = feedRelated(me, all)
    expect(related[0].id).toBe('frankl')
    expect(related.slice(1).map((b) => b.id)).toEqual(
      expect.arrayContaining(['seneca', 'epictetus']),
    )
  })

  it('excludes the book itself', () => {
    const related = feedRelated(all[0], all)
    expect(related.find((b) => b.id === 'meditations')).toBeUndefined()
  })

  it('dedupes when kindred overlap with same-cluster picks', () => {
    const target = mkBook({id: 'target', cluster: 'stoic', kindred: ['seneca']})
    const related = feedRelated(target, [target, ...all])
    const ids = related.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('caps results at 4 by default', () => {
    const many: EnrichedBook[] = Array.from({length: 10}, (_, i) =>
      mkBook({id: `s${i}`, cluster: 'stoic'}),
    )
    expect(feedRelated(many[0], many).length).toBe(4)
  })

  it('drops references to unknown kindred IDs', () => {
    const orphan = mkBook({id: 'o', cluster: 'stoic', kindred: ['ghost']})
    const related = feedRelated(orphan, [orphan, ...all])
    expect(related.find((b) => b.id === 'ghost')).toBeUndefined()
  })
})
