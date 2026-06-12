import React from 'react'
import katex from 'katex'

const SHARED_OPTIONS = {
  throwOnError: false,
  strict: 'warn' as const,
  trust: false,
}

export const MathInline: React.FC<{tex: string}> = ({tex}) => (
  <span
    className="math-inline"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(tex, {
        ...SHARED_OPTIONS,
        displayMode: false,
      }),
    }}
  />
)

export const MathBlock: React.FC<{tex: string}> = ({tex}) => (
  <div
    className="math-block"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(tex, {
        ...SHARED_OPTIONS,
        displayMode: true,
      }),
    }}
  />
)
