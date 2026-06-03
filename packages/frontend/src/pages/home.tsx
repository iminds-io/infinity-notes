// ABOUTME: Home page — "The Feed", a warm editorial browse of beliefs across modes of thought.
// ABOUTME: Wires hero, themed rows, search results, the detail drawer, and serendipity flows.

import {useCallback, useEffect, useMemo, useState} from 'react'
import {fetchBooks} from '../api/client'
import {
  enrichBooks,
  getCluster,
  UNCATEGORIZED_CLUSTER_ID,
  type EnrichedBook,
} from '../data/book-enrichment'
import {
  dailyBook,
  feedRelated,
  matchScore,
  yearNum,
} from '../data/feed-helpers'
import {FeedTopBar} from '../components/feed/feed-topbar'
import {FeedHero} from '../components/feed/feed-hero'
import {ClusterRow, BookCover} from '../components/feed/feed-cover-row'
import {FeedDrawer} from '../components/feed/feed-drawer'

const ROW_ORDER: ReadonlyArray<string | '__ancient' | '__contemporary'> = [
  'stoic',
  'exist',
  'east',
  '__ancient',
  'mind',
  'cosmos',
  'power',
  '__contemporary',
  'living',
  'just',
  UNCATEGORIZED_CLUSTER_ID,
]

const ANCIENT_CUTOFF = 1600
const CONTEMPORARY_CUTOFF = 2000

const hueOf = (book: EnrichedBook): number =>
  getCluster(book.cluster)?.hue ?? 24
const shortOf = (book: EnrichedBook): string =>
  getCluster(book.cluster)?.short ?? 'Unsorted'

export const HomePage: React.FC = () => {
  const [books, setBooks] = useState<EnrichedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [trail, setTrail] = useState<EnrichedBook[]>([])

  useEffect(() => {
    fetchBooks()
      .then((raw) => setBooks(enrichBooks(raw)))
      .finally(() => setLoading(false))
  }, [])

  const byId = useMemo(() => {
    const m = new Map<string, EnrichedBook>()
    books.forEach((b) => m.set(b.id, b))
    return m
  }, [books])

  const featured = useMemo(() => dailyBook(books), [books])
  const selBook = selectedId ? byId.get(selectedId) ?? null : null

  const openBook = useCallback(
    (book: EnrichedBook, opts?: {fresh?: boolean}) => {
      setSelectedId(book.id)
      setTrail((t) => {
        if (opts?.fresh) return [book]
        const last = t[t.length - 1]
        if (last && last.id === book.id) return t
        return [...t, book]
      })
    },
    [],
  )

  const surprise = useCallback(() => {
    if (!books.length) return
    const pick = books[Math.floor(Math.random() * books.length)]
    openBook(pick, {fresh: true})
  }, [books, openBook])

  const stumble = useCallback(
    (from: EnrichedBook) => {
      const rel = feedRelated(from, books)
      if (!rel.length && !books.length) return
      const visited = new Set(trail.map((t) => t.id))
      const fresh = rel.filter((r) => !visited.has(r.id))
      const pool = fresh.length ? fresh : rel
      const next = pool.length
        ? pool[Math.floor(Math.random() * pool.length)]
        : books[Math.floor(Math.random() * books.length)]
      openBook(next)
    },
    [books, openBook, trail],
  )

  const close = useCallback(() => setSelectedId(null), [])

  const q = query.trim()
  const results = useMemo(
    () => (q ? books.filter((b) => matchScore(b, q)) : []),
    [q, books],
  )

  const rows = useMemo(() => {
    const ancient = books
      .filter((b) => {
        const n = yearNum(b.year)
        return n !== 0 && n < ANCIENT_CUTOFF
      })
      .sort((a, z) => yearNum(a.year) - yearNum(z.year))
    const contemporary = books
      .filter((b) => yearNum(b.year) >= CONTEMPORARY_CUTOFF)
      .sort((a, z) => yearNum(z.year) - yearNum(a.year))

    return ROW_ORDER.flatMap((id) => {
      if (id === '__ancient') {
        return ancient.length
          ? [
              {
                key: 'ancient',
                label: 'Ancient roots',
                blurb: 'the oldest still-living ideas',
                books: ancient,
              },
            ]
          : []
      }
      if (id === '__contemporary') {
        return contemporary.length
          ? [
              {
                key: 'contemporary',
                label: 'The contemporary shelf',
                blurb: 'minds of our own century',
                books: contemporary,
              },
            ]
          : []
      }
      const cluster = getCluster(id)
      if (!cluster) return []
      const bucket = books.filter((b) => b.cluster === id)
      if (!bucket.length) return []
      return [
        {
          key: cluster.id,
          label: cluster.name,
          blurb: cluster.blurb,
          books: bucket,
        },
      ]
    })
  }, [books])

  const lastOpened = trail[trail.length - 1]
  const becauseRow = lastOpened
    ? feedRelated(lastOpened, books)
    : []
  const drawerRelated = selBook ? feedRelated(selBook, books) : []

  return (
    <div className="feed-shell">
      <FeedTopBar query={query} onQuery={setQuery} onSurprise={surprise} />

      {q ? (
        <div className="feed-results">
          <div className="feed-results-head">
            <h2>{results.length ? 'Perspectives' : 'Nothing here'}</h2>
            <span className="feed-row-count">
              {results.length} matching &ldquo;{q}&rdquo;
            </span>
          </div>
          {results.length ? (
            <div className="feed-results-grid">
              {results.map((b) => (
                <BookCover
                  key={b.id}
                  book={b}
                  hue={hueOf(b)}
                  clusterShort={shortOf(b)}
                  onOpen={openBook}
                />
              ))}
            </div>
          ) : (
            <div className="feed-results-empty">
              No perspective matches that — try a thinker, a theme, or a single
              word.
            </div>
          )}
        </div>
      ) : featured ? (
        <>
          <FeedHero
            book={featured}
            hue={hueOf(featured)}
            clusterShort={shortOf(featured)}
            onOpen={openBook}
            onSurprise={surprise}
          />
          <div className="feed-rows">
            {becauseRow.length > 0 && lastOpened ? (
              <ClusterRow
                key={'because-' + lastOpened.id}
                label={`Because you opened ${lastOpened.title}`}
                blurb="threads worth following"
                books={becauseRow}
                hueOf={hueOf}
                shortOf={shortOf}
                onOpen={openBook}
              />
            ) : null}
            {rows.map((r) => (
              <ClusterRow
                key={r.key}
                label={r.label}
                blurb={r.blurb}
                books={r.books}
                hueOf={hueOf}
                shortOf={shortOf}
                onOpen={openBook}
              />
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            padding: '120px 40px',
            textAlign: 'center',
            fontFamily: 'var(--feed-body)',
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
          }}
        >
          {loading
            ? 'Drawing the catalog…'
            : 'No perspectives are loaded yet.'}
        </div>
      )}

      <FeedDrawer
        book={selBook}
        trail={trail}
        related={drawerRelated}
        hueOf={hueOf}
        onClose={close}
        onPick={openBook}
        onStumble={stumble}
      />
    </div>
  )
}
