// ABOUTME: Smoke tests for The Feed — top bar, hero, cluster rows, drawer flow, search results.
// ABOUTME: Mocks fetchBooks; relies on real enrichment data for known book IDs.

import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {HomePage} from './home'
import {fetchBooks} from '../api/client'

vi.mock('../api/client', () => ({
  fetchBooks: vi.fn(),
}))

const mockedFetchBooks = vi.mocked(fetchBooks)

const sapiens = {
  id: 'sapiens',
  title: 'Sapiens: A Brief History of Humankind',
  authors: ['Yuval Noah Harari'],
  description: 'A history of Homo sapiens organized around cooperation.',
  noteCount: 60,
}

const homoDeus = {
  id: 'homo-deus',
  title: 'Homo Deus: A Brief History of Tomorrow',
  authors: ['Yuval Noah Harari'],
  description: 'A speculative history of the future.',
  noteCount: 40,
}

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

describe('HomePage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows the brand mark and search input', async () => {
    mockedFetchBooks.mockResolvedValue([sapiens, homoDeus])
    renderHome()
    expect(await screen.findByText(/Oh My Beliefs/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Search a belief, a thinker/i),
    ).toBeInTheDocument()
  })

  it('renders the perspective of the day hero once books load', async () => {
    mockedFetchBooks.mockResolvedValue([sapiens, homoDeus])
    renderHome()
    expect(
      await screen.findByText(/Perspective of the day/i),
    ).toBeInTheDocument()
  })

  it('renders cluster rows for clusters that have books', async () => {
    mockedFetchBooks.mockResolvedValue([sapiens, homoDeus])
    renderHome()
    // Sapiens → "Power & Society"; Homo Deus → "Mind & Cognition"
    expect(
      await screen.findByRole('heading', {name: /Power & Society/i}),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {name: /Mind & Cognition/i}),
    ).toBeInTheDocument()
  })

  it('opens the drawer with belief and synthesis when a cover is clicked', async () => {
    const user = userEvent.setup()
    mockedFetchBooks.mockResolvedValue([sapiens, homoDeus])
    renderHome()
    const sapiensCovers = await screen.findAllByRole('button', {
      name: /Open Sapiens/i,
    })
    await user.click(sapiensCovers[0])
    const drawer = await screen.findByRole('complementary', {
      name: /Sapiens.*details/i,
    })
    expect(within(drawer).getByText(/The belief/i)).toBeInTheDocument()
    expect(
      within(drawer).getByRole('link', {name: /Enter this book/i}),
    ).toHaveAttribute('href', '/books/sapiens')
  })

  it('filters into a results grid when the user searches', async () => {
    const user = userEvent.setup()
    mockedFetchBooks.mockResolvedValue([sapiens, homoDeus])
    renderHome()
    await screen.findByText(/Perspective of the day/i)
    const input = screen.getByPlaceholderText(/Search a belief/i)
    await user.type(input, 'harari')
    expect(
      await screen.findByRole('heading', {name: /Perspectives/i}),
    ).toBeInTheDocument()
    expect(screen.getByText(/2 matching/i)).toBeInTheDocument()
  })

  it('shows an empty-state message when no perspectives match the search', async () => {
    const user = userEvent.setup()
    mockedFetchBooks.mockResolvedValue([sapiens, homoDeus])
    renderHome()
    await screen.findByText(/Perspective of the day/i)
    const input = screen.getByPlaceholderText(/Search a belief/i)
    await user.type(input, 'zzzzzzz')
    expect(
      await screen.findByRole('heading', {name: /Nothing here/i}),
    ).toBeInTheDocument()
  })

  it('falls back to a calm message when the catalog is empty', async () => {
    mockedFetchBooks.mockResolvedValue([])
    renderHome()
    expect(
      await screen.findByText(/No perspectives are loaded yet/i),
    ).toBeInTheDocument()
  })
})
