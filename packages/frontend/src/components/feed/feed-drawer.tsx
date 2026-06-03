// ABOUTME: Right-side detail drawer — belief, synthesis, stumble button, kindred jumps.
// ABOUTME: Portaled to document.body to escape any ancestor containing-block clipping.

import {useEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import {Link} from 'react-router-dom'
import type {EnrichedBook} from '../../data/book-enrichment'
import {coverFaceColor} from './feed-cover-row'

interface Props {
  book: EnrichedBook | null
  trail: EnrichedBook[]
  related: EnrichedBook[]
  hueOf: (book: EnrichedBook) => number
  onClose: () => void
  onPick: (book: EnrichedBook) => void
  onStumble: (from: EnrichedBook) => void
}

export const FeedDrawer: React.FC<Props> = ({
  book,
  trail,
  related,
  hueOf,
  onClose,
  onPick,
  onStumble,
}) => {
  const open = book !== null
  // keep the last book mounted through the slide-out transition
  const [shown, setShown] = useState<EnrichedBook | null>(book)
  useEffect(() => {
    if (book) setShown(book)
  }, [book])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const b = book ?? shown
  const accent = b ? coverFaceColor(hueOf(b)) : undefined

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        className={`feed-scrim${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`feed-drawer${open ? ' open' : ''}`}
        style={{borderLeft: accent ? `3px solid ${accent}` : 'none'}}
        aria-hidden={!open}
        aria-label={b ? `${b.title} details` : 'Book details'}
      >
        {b ? (
          <>
            <div className="feed-drawer-top">
              <div className="feed-trail">
                {trail.length > 1
                  ? trail.slice(-3).map((t, i, arr) => (
                      <span key={t.id + ':' + i} style={{display: 'inline-flex', gap: 7}}>
                        {i > 0 ? <span>→</span> : null}
                        {i === arr.length - 1 ? <b>{t.title}</b> : <span>{t.title}</span>}
                      </span>
                    ))
                  : null}
              </div>
              <button
                className="feed-drawer-close"
                onClick={onClose}
                aria-label="Close details"
                type="button"
              />
            </div>
            <div className="feed-drawer-body">
              <div className="feed-drawer-cluster" style={{color: accent}}>
                {b.clusterName}
              </div>
              <h2 className="feed-drawer-title">{b.title}</h2>
              <div className="feed-drawer-byline">
                {b.authors.join(', ')}
                {b.year ? ` · ${b.year}` : ''}
              </div>

              {b.essence ? (
                <div className="feed-drawer-belief">
                  <div className="feed-lab" style={{color: accent}}>
                    The belief
                  </div>
                  <div className="feed-q">&ldquo;{b.essence}&rdquo;</div>
                </div>
              ) : null}

              <p className="feed-drawer-note">{b.synthesis}</p>

              <Link to={`/books/${b.id}`} className="feed-drawer-enter">
                Enter this book →
              </Link>

              {related.length > 0 ? (
                <>
                  <button
                    className="feed-stumble"
                    onClick={() => onStumble(b)}
                    type="button"
                  >
                    ✳ &nbsp;Stumble onward
                  </button>
                  <div className="feed-stumble-hint">
                    follow a thread to a kindred mind
                  </div>

                  <div className="feed-kindred-lab">Kindred perspectives</div>
                  {related.map((r) => (
                    <button
                      key={r.id}
                      className="feed-kindred-item"
                      onClick={() => onPick(r)}
                      type="button"
                    >
                      <span
                        className="feed-kindred-dot"
                        style={{background: coverFaceColor(hueOf(r))}}
                      />
                      <span className="feed-kindred-t">{r.title}</span>
                      <span className="feed-kindred-a">
                        {r.authors.join(', ')}
                      </span>
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </aside>
    </>,
    document.body,
  )
}
