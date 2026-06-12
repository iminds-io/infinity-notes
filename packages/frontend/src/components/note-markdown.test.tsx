import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {NoteMarkdown} from './note-markdown'

const renderMarkdown = (markdown: string) =>
  render(<NoteMarkdown bookId="test-book" markdown={markdown} />)

describe('NoteMarkdown', () => {
  it('should render inline math through KaTeX', () => {
    const {container} = renderMarkdown('Energy: $E = mc^2$.')

    expect(container.querySelector('.katex')).toBeInTheDocument()
  })

  it('should render block math through KaTeX display markup', () => {
    const {container} = renderMarkdown('$$\nH = -\\sum p_i \\log p_i\n$$')

    expect(container.querySelector('.katex-display')).toBeInTheDocument()
  })

  it('should keep currency text from rendering as math', () => {
    const {container} = renderMarkdown('Cost: $5 today')

    expect(container.querySelectorAll('.katex')).toHaveLength(0)
    expect(screen.getByText('Cost: $5 today')).toBeInTheDocument()
  })

  it('should render escaped dollars as literal text', () => {
    const {container} = renderMarkdown('Backslash escape: \\$50.')

    expect(container.querySelector('p')).toHaveTextContent('Backslash escape: $50.')
  })

  it('should render math and backlinks in the same paragraph', () => {
    const {container} = renderMarkdown('Math $x^2$ and [[Welcome]].')

    expect(container.querySelector('.katex')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Welcome'})).toHaveAttribute(
      'href',
      'Welcome',
    )
  })
})
