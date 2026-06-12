import {describe, expect, it} from 'vitest'
import {markdownToTokens} from './markdown'

type MarkdownToken = Record<string, any>

const flattenTokens = (tokens: MarkdownToken[]): MarkdownToken[] =>
  tokens.flatMap((token) => [
    token,
    ...(token.type === 'backlink' ? [] : flattenTokens(token.tokens || [])),
    ...flattenTokens(token.items || []),
  ])

const inlineTokens = (markdown: string) =>
  flattenTokens(markdownToTokens(markdown) as MarkdownToken[]).filter((token) =>
    ['text', 'escape', 'mathInline', 'backlink'].includes(token.type),
  )

const mathTokens = (markdown: string) =>
  flattenTokens(markdownToTokens(markdown) as MarkdownToken[]).filter((token) =>
    ['mathInline', 'mathBlock'].includes(token.type),
  )

describe('markdownToTokens', () => {
  it('should emit inline math tokens for single-dollar delimiters', () => {
    expect(mathTokens('$a$')).toMatchObject([{type: 'mathInline', tex: 'a'}])
  })

  it('should emit block math tokens for double-dollar delimiters', () => {
    expect(mathTokens('$$\nx + y\n$$')).toMatchObject([
      {type: 'mathBlock', tex: 'x + y'},
    ])
  })

  it('should keep bare currency amounts as text', () => {
    expect(mathTokens('$5')).toHaveLength(0)
  })

  it('should keep paired currency amounts as text', () => {
    expect(mathTokens('$5 and $10')).toHaveLength(0)
  })

  it('should preserve escaped dollar signs as text', () => {
    expect(mathTokens('\\$50')).toHaveLength(0)
    expect(inlineTokens('\\$50')).toEqual([
      expect.objectContaining({type: 'escape', text: '$'}),
      expect.objectContaining({type: 'text', text: '50'}),
    ])
  })

  it('should emit inline math between surrounding text tokens', () => {
    expect(inlineTokens('Mix: $x^2$ next.')).toMatchObject([
      {type: 'text', text: 'Mix: '},
      {type: 'mathInline', tex: 'x^2'},
      {type: 'text', text: ' next.'},
    ])
  })

  it('should emit block math as a top-level token between paragraphs', () => {
    const nonSpaceTokens = markdownToTokens(
      'Before\n\n$$\nx + y\n$$\n\nAfter',
    ).filter((token) => token.type !== 'space')

    expect(nonSpaceTokens).toMatchObject([
      {type: 'paragraph'},
      {type: 'mathBlock', tex: 'x + y'},
      {type: 'paragraph'},
    ])
  })

  it('should still tokenize backlinks', () => {
    expect(inlineTokens('See [[Backlink]].')).toEqual([
      expect.objectContaining({type: 'text', text: 'See '}),
      expect.objectContaining({type: 'backlink', path: 'Backlink'}),
      expect.objectContaining({type: 'text', text: '.'}),
    ])
  })
})
