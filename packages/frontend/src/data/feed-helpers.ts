// ABOUTME: Browse-feed utilities — year parsing, search, daily pick, kindred relation.
// ABOUTME: Pure functions kept independent of React so they can be tested in isolation.

import type {EnrichedBook} from './book-enrichment'

export function yearNum(year: string): number {
  const digits = year.match(/\d+/)?.[0]
  if (!digits) return 0
  const n = parseInt(digits, 10)
  return /bce/i.test(year) ? -n : n
}

export function matchScore(book: EnrichedBook, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false
  const hay = [
    book.title,
    book.authors.join(' '),
    book.essence,
    book.synthesis,
    book.description,
    book.clusterName,
  ]
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).every((term) => hay.includes(term))
}

export function dailyBook(
  books: EnrichedBook[],
  date: Date = new Date(),
): EnrichedBook | null {
  if (books.length === 0) return null
  const yearStart = new Date(date.getFullYear(), 0, 0)
  const doy = Math.floor((date.getTime() - yearStart.getTime()) / 86_400_000)
  return books[doy % books.length]
}

export function feedRelated(
  book: EnrichedBook,
  allBooks: EnrichedBook[],
  maxCount = 4,
): EnrichedBook[] {
  const byId = new Map(allBooks.map((b) => [b.id, b]))
  const kindred = book.kindred
    .map((id) => byId.get(id))
    .filter((b): b is EnrichedBook => Boolean(b) && b!.id !== book.id)
  const sameCluster = allBooks.filter(
    (b) => b.cluster === book.cluster && b.id !== book.id,
  )
  const seen = new Set<string>()
  const ordered: EnrichedBook[] = []
  for (const candidate of [...kindred, ...sameCluster]) {
    if (seen.has(candidate.id)) continue
    seen.add(candidate.id)
    ordered.push(candidate)
    if (ordered.length >= maxCount) break
  }
  return ordered
}
