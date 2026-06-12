import {render} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {Note} from '../interfaces/note'
import {NoteLinks} from './note-links'

const noteWithLinkedSnippet = (snippet: string): Note => ({
  path: 'Target',
  title: 'Target',
  snippet: '',
  markdown: '# Target',
  linkedFromNotes: [
    {
      path: 'Source',
      title: 'Source',
      snippet,
    },
  ],
})

describe('NoteLinks', () => {
  it('should render math in link snippets', () => {
    const {container} = render(
      <NoteLinks
        bookId="test-book"
        note={noteWithLinkedSnippet('Source uses $x^2$.')}
      />,
    )

    expect(container.querySelector('.katex')).toBeInTheDocument()
  })
})
