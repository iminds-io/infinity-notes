// ABOUTME: Typographic book cover and horizontally-scrollable themed row (drag + arrows).
// ABOUTME: Suppresses click-after-drag so dragging a row never accidentally opens a book.

import {useCallback, useRef} from 'react'
import type {EnrichedBook} from '../../data/book-enrichment'

export const coverFaceColor = (hue: number): string =>
  `oklch(0.5 0.135 ${hue})`

interface CoverProps {
  book: EnrichedBook
  hue: number
  clusterShort: string
  width?: number
  height?: number
  onOpen: (book: EnrichedBook) => void
}

export const BookCover: React.FC<CoverProps> = ({
  book,
  hue,
  clusterShort,
  width = 172,
  height = 250,
  onOpen,
}) => {
  const titleSize = Math.round(width * 0.155)
  const authorSize = Math.round(width * 0.083)
  return (
    <button
      className="feed-cover"
      style={{width}}
      onClick={() => onOpen(book)}
      aria-label={`Open ${book.title}`}
    >
      <div
        className="feed-cover-face"
        style={{width, height, background: coverFaceColor(hue)}}
      >
        <div className="feed-cover-frame" />
        <div className="feed-cover-inner">
          <div className="feed-cover-tag">{clusterShort}</div>
          <div className="feed-cover-title" style={{fontSize: titleSize}}>
            {book.title}
          </div>
          <div className="feed-cover-author" style={{fontSize: authorSize}}>
            {book.authors.join(', ')}
          </div>
          {book.year ? <div className="feed-cover-year">{book.year}</div> : null}
        </div>
        {book.essence ? (
          <div className="feed-cover-essence">
            <div>
              <p>&ldquo;{book.essence}&rdquo;</p>
              <span className="feed-cover-open">Open the belief →</span>
            </div>
          </div>
        ) : null}
      </div>
    </button>
  )
}

interface RowProps {
  label: string
  blurb?: string
  books: EnrichedBook[]
  hueOf: (book: EnrichedBook) => number
  shortOf: (book: EnrichedBook) => string
  onOpen: (book: EnrichedBook) => void
}

export const ClusterRow: React.FC<RowProps> = ({
  label,
  blurb,
  books,
  hueOf,
  shortOf,
  onOpen,
}) => {
  const scRef = useRef<HTMLDivElement>(null)
  const movedRef = useRef(false)
  const dragRef = useRef<{x: number; sl: number} | null>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = scRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.8, 620),
      behavior: 'smooth',
    })
  }

  const onMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current
    if (!d || !scRef.current) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 6) movedRef.current = true
    scRef.current.scrollLeft = d.sl - dx
  }, [])

  const onUp = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    setTimeout(() => {
      movedRef.current = false
    }, 0)
  }, [onMove])

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !scRef.current) return
    dragRef.current = {x: e.clientX, sl: scRef.current.scrollLeft}
    movedRef.current = false
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  if (!books.length) return null

  return (
    <section className="feed-row" aria-label={label}>
      <div className="feed-row-head">
        <h2>{label}</h2>
        {blurb ? <span className="feed-row-blurb">{blurb}</span> : null}
        <span className="feed-row-count">
          {books.length} {books.length === 1 ? 'title' : 'titles'}
        </span>
      </div>
      <div className="feed-row-wrap">
        <button
          className="feed-row-arrow left"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          type="button"
        >
          ‹
        </button>
        <div
          className="feed-row-scroll"
          ref={scRef}
          onPointerDown={onDown}
          onClickCapture={onClickCapture}
        >
          {books.map((b) => (
            <BookCover
              key={b.id}
              book={b}
              hue={hueOf(b)}
              clusterShort={shortOf(b)}
              onOpen={onOpen}
            />
          ))}
        </div>
        <button
          className="feed-row-arrow right"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          type="button"
        >
          ›
        </button>
      </div>
    </section>
  )
}
