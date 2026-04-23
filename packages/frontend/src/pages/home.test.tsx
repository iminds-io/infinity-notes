import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {BookSelectorPage} from './home'
import {fetchBooks} from '../api/client'

vi.mock('../api/client', () => ({
  fetchBooks: vi.fn(),
}))

const mockedFetchBooks = vi.mocked(fetchBooks)

describe('BookSelectorPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should present Oh My Beliefs positioning and keep the book catalog available', async () => {
    mockedFetchBooks.mockResolvedValue([
      {
        id: 'sapiens',
        title: 'Sapiens',
        authors: ['Yuval Noah Harari'],
        description: 'A brief history of humankind.',
        noteCount: 63,
      },
    ])

    render(
      <MemoryRouter>
        <BookSelectorPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {name: 'Oh My Beliefs'}),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/refine your thoughts and beliefs/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Compression with Fidelity Toward Clarity/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {name: 'Choose a book'}),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', {name: 'Book Catalog'}),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', {name: /Sapiens/i}),
    ).toHaveAttribute('href', '/books/sapiens')
  })
})
