import {marked} from 'marked'

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

marked.use({
  extensions: [BacklinkTokenizerExtension, BacklinkRendererExtension] as any,
})

export const markdownToTokens = (markdown: string) => marked.lexer(markdown)
