// ABOUTME: Sticky top bar — brand mark, full-width search, and the Surprise jump.
// ABOUTME: Pure presentation; the parent owns query state and randomness.

interface Props {
  query: string
  onQuery: (next: string) => void
  onSurprise: () => void
}

export const FeedTopBar: React.FC<Props> = ({query, onQuery, onSurprise}) => {
  return (
    <div className="feed-topbar">
      <span className="feed-brand">Oh&nbsp;My&nbsp;Beliefs</span>
      <div className="feed-topbar-search">
        <div className="feed-searchbox">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{flex: '0 0 auto', opacity: 0.5}}
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search a belief, a thinker, a way of seeing…"
            aria-label="Search perspectives"
          />
          {query ? (
            <button
              onClick={() => onQuery('')}
              aria-label="Clear search"
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-faint)',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
      <button
        className="feed-btn-surprise"
        onClick={onSurprise}
        type="button"
      >
        <span aria-hidden="true" style={{fontSize: 13}}>
          ✳
        </span>{' '}
        Surprise me
      </button>
    </div>
  )
}
