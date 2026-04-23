import {Note, NotePreview} from '@infinity-notes/note-processor'
import {fetchNote, fetchPreviews} from './client'

const previewsCache: Record<string, NotePreview[]> = {}
const notesCache: Record<string, Record<string, Note>> = {}

export const getCachedPreviews = async (bookId: string): Promise<NotePreview[]> => {
  if (!previewsCache[bookId]) {
    previewsCache[bookId] = await fetchPreviews(bookId)
  }

  return previewsCache[bookId]
}

export const getCachedNote = async (
  bookId: string,
  notePath: string,
): Promise<Note | null> => {
  notesCache[bookId] ||= {}

  if (!notesCache[bookId][notePath]) {
    const note = await fetchNote(bookId, notePath)
    if (!note) return null
    notesCache[bookId][note.path] = note
    notesCache[bookId][notePath] = note
  }

  return notesCache[bookId][notePath]
}

export const populateNoteCache = (bookId: string, notes: Note[]) => {
  notesCache[bookId] ||= {}
  for (const note of notes) {
    notesCache[bookId][note.path] = note
  }
}

export const clearCaches = () => {
  for (const key of Object.keys(previewsCache)) delete previewsCache[key]
  for (const key of Object.keys(notesCache)) delete notesCache[key]
}
