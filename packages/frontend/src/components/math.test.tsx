import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {MathBlock, MathInline} from './math'

describe('MathInline', () => {
  it('should render inline KaTeX markup', () => {
    const {container} = render(<MathInline tex="x^2" />)

    expect(container.querySelector('span .katex')).toBeInTheDocument()
  })

  it('should render invalid TeX as a KaTeX error without throwing', () => {
    const {container} = render(<MathInline tex="\\frac{" />)

    expect(container.querySelector('.katex-error')).toHaveTextContent('\\frac{')
  })

  it('should include the original TeX source in the generated markup', () => {
    render(<MathInline tex="x^2" />)

    expect(screen.getByText('x^2').textContent).toBe('x^2')
  })
})

describe('MathBlock', () => {
  it('should render display KaTeX markup', () => {
    const {container} = render(<MathBlock tex="x^2" />)

    expect(container.querySelector('div .katex-display')).toBeInTheDocument()
  })
})
