import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {NotesBrowserItem} from './notes-browser-item'
import {Note} from '../interfaces/note'

const note = (title: string): Note => ({
  path: title,
  title,
  snippet: '',
  markdown: `# ${title}`,
  linkedFromNotes: [],
})

describe('NotesBrowserItem', () => {
  it('should use upright vertical writing for collapsed Hangul titles', () => {
    render(
      <NotesBrowserItem
        bookId="age-of-thinking"
        note={note('생각의 도구')}
        index={0}
        collapsed
      />,
    )

    const collapsedTitle = screen.getByText('생각의 도구')

    expect(collapsedTitle).toHaveClass('writing-vertical-upright')
    expect(collapsedTitle).not.toHaveClass('writing-vertical-latin')
  })

  it('should keep rotated vertical writing for collapsed Latin titles', () => {
    render(
      <NotesBrowserItem
        bookId="surfaces-and-essences"
        note={note('Analogy')}
        index={0}
        collapsed
      />,
    )

    const collapsedTitle = screen.getByText('Analogy')

    expect(collapsedTitle).toHaveClass('writing-vertical-latin')
    expect(collapsedTitle).not.toHaveClass('writing-vertical-upright')
  })
})
