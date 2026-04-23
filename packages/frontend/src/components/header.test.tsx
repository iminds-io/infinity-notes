import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {describe, expect, it} from 'vitest'
import {Header} from './header'

describe('Header', () => {
  it('should show app home and book home links on book pages', () => {
    render(
      <MemoryRouter>
        <Header title="sapiens" bookId="sapiens" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', {name: 'Oh My Beliefs'})).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', {name: 'sapiens'})).toHaveAttribute(
      'href',
      '/books/sapiens',
    )
  })
})
