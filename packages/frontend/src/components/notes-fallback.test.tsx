import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, useLocation} from 'react-router-dom'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {NotesFallback} from './notes-fallback'
import {Note} from '../interfaces/note'
import {getCachedNote} from '../api/cache'

const note = (path: string, title: string): Note => ({
  path,
  title,
  snippet: '',
  markdown: `# ${title}`,
  linkedFromNotes: [],
})

vi.mock('../api/cache', () => ({
  getCachedNote: vi.fn(),
}))

const mockedGetCachedNote = vi.mocked(getCachedNote)

const LocationProbe = () => {
  const location = useLocation()
  return <output aria-label="location">{location.pathname + location.search}</output>
}

describe('NotesFallback', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render every note in the mobile stack', () => {
    render(
      <MemoryRouter>
        <NotesFallback
          bookId="surfaces-and-essences"
          initialNotes={[
            note('Welcome', 'Surfaces and Essences'),
            note('About', 'About These Notes'),
          ]}
          concepts={[]}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {name: 'Surfaces and Essences'}),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {name: 'About These Notes'}),
    ).toBeInTheDocument()
  })

  it('should append a linked note to the mobile stack', async () => {
    const user = userEvent.setup()
    mockedGetCachedNote.mockResolvedValue(
      note(
        'threads/Analogy as the Core of Cognition',
        'Analogy as the Core of Cognition',
      ),
    )

    render(
      <MemoryRouter>
        <LocationProbe />
        <NotesFallback
          bookId="surfaces-and-essences"
          initialNotes={[
            {
              ...note('Welcome', 'Surfaces and Essences'),
              markdown:
                '# Surfaces and Essences\n\n[[Analogy as the Core of Cognition]]',
            },
          ]}
          concepts={[]}
        />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('link', {name: 'Analogy as the Core of Cognition'}),
    )

    expect(mockedGetCachedNote).toHaveBeenCalledWith(
      'surfaces-and-essences',
      'Analogy as the Core of Cognition',
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Analogy as the Core of Cognition',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('location')).toHaveTextContent(
      '/books/surfaces-and-essences/Welcome?stacked=threads%2FAnalogy+as+the+Core+of+Cognition',
    )
  })
})
