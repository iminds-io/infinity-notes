import {backlinkNames} from './markdown'
import {hydrateNote, noteToNotePreview} from './hydrate'
import {resolveNotePath} from './resolve'
import {BookIndex, Note, NotePreview} from './types'

export const getConceptPreviews = (allNotes: Note[]): NotePreview[] => {
  return allNotes
    .filter((note) => note.type === 'concept')
    .map(noteToNotePreview)
    .sort((a, b) => a.title.localeCompare(b.title))
}

export const buildBookIndex = (allNotes: Note[]): BookIndex => {
  const previews = allNotes.map(noteToNotePreview)
  const notes = Object.fromEntries(
    allNotes.map((note) => [note.path, hydrateNote(note, allNotes)]),
  )
  const graph = Object.fromEntries(
    allNotes.map((note) => [
      note.path,
      backlinkNames(note.markdown).flatMap((linkName) => {
        const resolved = resolveNotePath(linkName, allNotes)
        return resolved ? [resolved] : []
      }),
    ]),
  )

  return {
    previews,
    notes,
    concepts: getConceptPreviews(allNotes),
    graph,
  }
}
