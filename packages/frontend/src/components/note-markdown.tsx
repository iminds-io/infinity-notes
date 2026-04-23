import React, {MouseEvent} from 'react'
import {markdownToTokens} from '../helpers/markdown'
import {NoteBacklink} from './note-backlink'
import clsx from 'clsx'

interface Props {
  bookId: string
  markdown: string
  style?: React.CSSProperties
  size?: 'sm' | 'md'
  onClickBacklink?: (event: MouseEvent, path: string) => void
}

interface MarkdownOptions {
  bookId: string
  onClickBacklink?: (event: MouseEvent, path: string) => void
}

export const NoteMarkdown: React.FC<Props> = ({
  bookId,
  markdown,
  onClickBacklink,
  style,
  size = 'md',
}) => {
  return (
    <div
      className={clsx('prose w-auto', size === 'sm' ? 'prose-sm' : 'prose-md')}
      style={style}
    >
      {markdownToElements(markdown, {bookId, onClickBacklink})}
    </div>
  )
}

const elementWithKey = (element: React.ReactElement, key: string | number) => (
  <React.Fragment key={key}>{element}</React.Fragment>
)

type MarkdownToken = Record<string, any>

const tokensToElements = (tokens: MarkdownToken[], options: MarkdownOptions) => {
  return tokens.map((token, index) =>
    elementWithKey(tokenToElement(token, options), index),
  )
}

const textTokenToElement = (token: MarkdownToken, options: MarkdownOptions) => {
  if (token.tokens?.length) {
    return <span>{tokensToElements(token.tokens, options)}</span>
  }

  return <span dangerouslySetInnerHTML={{__html: token.text}} />
}

const tokenToElement = (token: MarkdownToken, options: MarkdownOptions) => {
  switch (token.type) {
    case 'heading':
      return React.createElement('h' + token.depth, {}, token.text)
    case 'text':
      return textTokenToElement(token, options)
    case 'paragraph':
      return <p>{tokensToElements(token.tokens || [], options)}</p>
    case 'link':
      return (
        <a href={token.href} target="_blank" rel="noreferrer">
          {tokensToElements(token.tokens || [], options)}
        </a>
      )
    case 'backlink':
      return (
        <NoteBacklink
          bookId={options.bookId}
          path={token.path}
          onClick={(event) => options.onClickBacklink?.(event, token.path)}
        />
      )
    case 'em':
      return <em>{tokensToElements(token.tokens || [], options)}</em>
    case 'blockquote':
      return <blockquote>{tokensToElements(token.tokens || [], options)}</blockquote>
    case 'hr':
      return <hr />
    case 'list':
      return token.ordered ? (
        <ol>{tokensToElements(token.items || [], options)}</ol>
      ) : (
        <ul>{tokensToElements(token.items || [], options)}</ul>
      )
    case 'list_item':
      return <li>{tokensToElements(token.tokens || [], options)}</li>
    case 'space':
      return <></>
    case 'code':
      return (
        <pre>
          <code>{token.text}</code>
        </pre>
      )
    case 'strong':
      return <strong>{tokensToElements(token.tokens || [], options)}</strong>
    default:
      return <></>
  }
}

const markdownToElements = (markdown: string, options: MarkdownOptions) => {
  return markdownToTokens(markdown).map((token, index) =>
    elementWithKey(tokenToElement(token as MarkdownToken, options), index),
  )
}
