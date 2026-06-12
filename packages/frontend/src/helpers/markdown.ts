import {marked} from 'marked'

const INLINE_MATH_RE = /^\$(?![\s$])((?:\\\$|[^$])+?)(?<!\s)\$(?!\d)/
const BLOCK_MATH_RE = /^\$\$\n?([\s\S]+?)\n?\$\$(?:\n|$)/

const BacklinkTokenizerExtension = {
  name: 'backlink',
  level: 'inline',
  start: (src: string) => src.match(/\[\[/)?.index || -1,
  tokenizer: (src: string) => {
    const rule = /^\[\[([^\]]+)\]\]/
    const match = rule.exec(src)

    if (!match) return undefined

    return {
      type: 'backlink',
      raw: match[0],
      path: match[1],
      tokens: [{type: 'text', raw: match[0], text: match[0]}],
    }
  },
}

const BacklinkRendererExtension = {
  name: 'backlink',
  renderer: (token: {path: string}) => `<a href="${token.path}">${token.path}</a>`,
}

const MathInlineTokenizerExtension = {
  name: 'mathInline',
  level: 'inline',
  start: (src: string) => src.indexOf('$'),
  tokenizer: (src: string) => {
    const match = INLINE_MATH_RE.exec(src)

    if (!match) return undefined

    return {
      type: 'mathInline',
      raw: match[0],
      tex: match[1],
      tokens: [],
    }
  },
}

const MathBlockTokenizerExtension = {
  name: 'mathBlock',
  level: 'block',
  start: (src: string) => src.indexOf('$$'),
  tokenizer: (src: string) => {
    const match = BLOCK_MATH_RE.exec(src)

    if (!match) return undefined

    return {
      type: 'mathBlock',
      raw: match[0],
      tex: match[1].trim(),
      tokens: [],
    }
  },
}

marked.use({
  extensions: [
    BacklinkTokenizerExtension,
    BacklinkRendererExtension,
    MathInlineTokenizerExtension,
    MathBlockTokenizerExtension,
  ] as any,
})

export const markdownToTokens = (markdown: string) => marked.lexer(markdown)
