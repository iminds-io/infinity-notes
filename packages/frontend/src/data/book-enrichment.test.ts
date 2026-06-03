// ABOUTME: Tests for the enrichment merge — BookMeta gets cluster/essence/synthesis/kindred,
// ABOUTME: with safe fallbacks when no curated entry exists for a given book id.

import {describe, expect, it} from 'vitest'
import type {BookMeta} from '@infinity-notes/note-processor'
import {
  CLUSTERS,
  UNCATEGORIZED_CLUSTER_ID,
  enrichBook,
  enrichBooks,
  getCluster,
} from './book-enrichment'

const sapiens: BookMeta = {
  id: 'sapiens',
  title: 'Sapiens: A Brief History of Humankind',
  authors: ['Yuval Noah Harari'],
  description:
    'A history of Homo sapiens organized around cooperation, myths, empires, markets, science, and power.',
  noteCount: 60,
}

const unknownBook: BookMeta = {
  id: 'made-up-book-id',
  title: 'A Book Not In Enrichment',
  authors: ['Nobody'],
  description: 'Two sentences. This is the second one.',
  noteCount: 1,
}

describe('enrichBook', () => {
  it('applies curated enrichment when present', () => {
    const enriched = enrichBook(sapiens)
    expect(enriched.cluster).not.toBe(UNCATEGORIZED_CLUSTER_ID)
    expect(enriched.essence.length).toBeGreaterThan(0)
    expect(enriched.synthesis.length).toBeGreaterThan(0)
    expect(enriched.year).not.toBe('')
    expect(enriched.clusterName).toBe(getCluster(enriched.cluster)?.name)
  })

  it('falls back gracefully for books without enrichment', () => {
    const enriched = enrichBook(unknownBook)
    expect(enriched.cluster).toBe(UNCATEGORIZED_CLUSTER_ID)
    expect(enriched.essence).toBe('Two sentences.')
    expect(enriched.synthesis).toBe(unknownBook.description)
    expect(enriched.year).toBe('')
    expect(enriched.kindred).toEqual([])
    expect(enriched.clusterName).toBe(
      getCluster(UNCATEGORIZED_CLUSTER_ID)?.name,
    )
  })

  it('preserves all BookMeta fields verbatim', () => {
    const enriched = enrichBook(sapiens)
    expect(enriched.id).toBe(sapiens.id)
    expect(enriched.title).toBe(sapiens.title)
    expect(enriched.authors).toEqual(sapiens.authors)
    expect(enriched.description).toBe(sapiens.description)
    expect(enriched.noteCount).toBe(sapiens.noteCount)
  })
})

describe('enrichBooks', () => {
  it('preserves input order', () => {
    const order = [unknownBook, sapiens]
    const enriched = enrichBooks(order)
    expect(enriched.map((b) => b.id)).toEqual(['made-up-book-id', 'sapiens'])
  })
})

describe('CLUSTERS', () => {
  it('always includes the uncategorized cluster', () => {
    expect(CLUSTERS.some((c) => c.id === UNCATEGORIZED_CLUSTER_ID)).toBe(true)
  })

  it('every cluster has a unique id and a hue', () => {
    const ids = CLUSTERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of CLUSTERS) {
      expect(typeof c.hue).toBe('number')
      expect(c.name.length).toBeGreaterThan(0)
    }
  })
})

describe('getCluster', () => {
  it('returns the cluster definition for known ids', () => {
    const stoic = getCluster('stoic')
    expect(stoic?.short).toBe('Stoicism')
  })

  it('returns null for unknown ids', () => {
    expect(getCluster('nope')).toBeNull()
  })
})
