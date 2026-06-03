// ABOUTME: Perspective-of-the-day hero — large quoted essence beside a tall cover thumbnail.
// ABOUTME: "Open the belief" routes through the same drawer flow as a cover click.

import type {EnrichedBook} from '../../data/book-enrichment'
import {BookCover} from './feed-cover-row'

interface Props {
  book: EnrichedBook
  hue: number
  clusterShort: string
  onOpen: (book: EnrichedBook) => void
  onSurprise: () => void
}

export const FeedHero: React.FC<Props> = ({
  book,
  hue,
  clusterShort,
  onOpen,
  onSurprise,
}) => {
  return (
    <section className="feed-hero" aria-label="Perspective of the day">
      <div>
        <div className="feed-kicker" style={{color: 'var(--accent)'}}>
          Perspective of the day
        </div>
        <blockquote className="feed-hero-quote">
          &ldquo;{book.essence}&rdquo;
        </blockquote>
        <div className="feed-hero-meta">
          <b>{book.title}</b> &nbsp;·&nbsp; {book.authors.join(', ')}
          {book.year ? ` · ${book.year}` : ''} &nbsp;·&nbsp; {book.clusterName}
        </div>
        <div className="feed-hero-actions">
          <button
            className="feed-btn feed-btn-solid"
            onClick={() => onOpen(book)}
            type="button"
          >
            Open the belief →
          </button>
          <button
            className="feed-btn feed-btn-ghost"
            onClick={onSurprise}
            type="button"
          >
            ✳ &nbsp;Surprise me
          </button>
        </div>
      </div>
      <div style={{flex: '0 0 auto'}}>
        <BookCover
          book={book}
          hue={hue}
          clusterShort={clusterShort}
          width={236}
          height={342}
          onOpen={onOpen}
        />
      </div>
    </section>
  )
}
