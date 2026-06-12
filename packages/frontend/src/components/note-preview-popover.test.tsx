import {render, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {getCachedNote} from '../api/cache'
import {NotePreviewPopover} from './note-preview-popover'

vi.mock('../api/cache', () => ({
  getCachedNote: vi.fn(),
}))

const mockedGetCachedNote = vi.mocked(getCachedNote)

describe('NotePreviewPopover', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render math in popover snippets', async () => {
    mockedGetCachedNote.mockResolvedValue({
      path: 'Quantum Probability',
      title: 'Quantum Probability',
      snippet: 'Born rule: $P_i = |\\psi_i|^2$.',
      markdown: '# Quantum Probability',
      linkedFromNotes: [],
    })

    const referenceElement = document.createElement('span')
    document.body.append(referenceElement)

    const {container} = render(
      <NotePreviewPopover
        bookId="test-book"
        path="Quantum Probability"
        referenceElement={referenceElement}
      />,
    )

    await waitFor(() => {
      expect(container.ownerDocument.querySelector('.katex')).toBeInTheDocument()
    })

    referenceElement.remove()
  })
})
