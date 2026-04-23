import {backlinkNames} from './markdown'
import {resolveNotePath} from './resolve'
import {Note, NotePreview} from './types'

const NOTE_INDEX_NAME = 'Welcome'

export const noteToNotePreview = (note: Note): NotePreview => {
  const preview: NotePreview = {
    path: note.path,
    title: note.title,
    snippet: note.snippet,
  }

  if (note.type) preview.type = note.type

  return preview
}

export const getBreadcrumbChain = (note: Note, allNotes: Note[]): NotePreview[] => {
  const chain: NotePreview[] = []
  const visited = new Set<string>()
  let current = note

  while (current.parent) {
    visited.add(current.path)

    const parentPath = resolveNotePath(current.parent, allNotes)
    if (!parentPath || visited.has(parentPath)) break

    const parent = allNotes.find((candidate) => candidate.path === parentPath)
    if (!parent) break

    chain.unshift(noteToNotePreview(parent))
    current = parent
  }

  return chain
}

export const hydrateNote = (note: Note, allNotes: Note[]): Note => {
  const linkedFromNotes = allNotes
    .filter((candidate) => candidate !== note && candidate.path !== NOTE_INDEX_NAME)
    .filter((candidate) =>
      backlinkNames(candidate.markdown).some(
        (linkName) => resolveNotePath(linkName, allNotes) === note.path,
      ),
    )
    .map(noteToNotePreview)

  return {
    ...note,
    linkedFromNotes,
    breadcrumb: getBreadcrumbChain(note, allNotes),
  }
}
