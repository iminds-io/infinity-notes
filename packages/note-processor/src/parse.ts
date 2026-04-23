import parseFrontMatter from 'front-matter'
import {Note} from './types'

export const markdownToSnippet = (markdown: string): string => {
  return markdown
    .replace(/^#.+$/gm, '')
    .split('\n')
    .filter((line) => line.trim())
    .slice(0, 2)
    .join(' ')
}

export const parseNote = (notePath: string, content: string): Note => {
  const {attributes, body} = parseFrontMatter<{
    title?: string
    snippet?: string
    type?: 'concept' | 'thread'
    parent?: string
    source_chapter?: number[]
  }>(content)

  const note: Note = {
    path: notePath,
    title: attributes.title || notePath,
    snippet: attributes.snippet || markdownToSnippet(body),
    markdown: body,
    linkedFromNotes: [],
  }

  if (attributes.type) note.type = attributes.type
  if (attributes.parent) note.parent = attributes.parent
  if (attributes.source_chapter) note.sourceChapter = attributes.source_chapter

  return note
}
