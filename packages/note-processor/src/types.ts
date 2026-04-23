export interface NotePreview {
  path: string
  title: string
  snippet: string
  type?: 'concept' | 'thread'
}

export interface Note extends NotePreview {
  markdown: string
  linkedFromNotes: NotePreview[]
  parent?: string
  sourceChapter?: number[]
  breadcrumb?: NotePreview[]
}

export interface BookMeta {
  id: string
  title: string
  authors: string[]
  description: string
  noteCount: number
}

export interface BookIndex {
  previews: NotePreview[]
  notes: Record<string, Note>
  concepts: NotePreview[]
  graph: Record<string, string[]>
}
