import React from 'react'
import {Note, NotePreview} from '../interfaces/note'
import {NotesFallback} from './notes-fallback'
import {NotesBrowser} from './notes-browser'
import {useMediaQuery} from '../helpers/use-media-query'

interface Props {
  bookId: string
  initialNotes?: Note[]
  concepts?: NotePreview[]
}

export const Notes: React.FC<Props> = ({bookId, initialNotes = [], concepts = []}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return isDesktop ? (
    <NotesBrowser bookId={bookId} initialNotes={initialNotes} concepts={concepts} />
  ) : (
    <NotesFallback bookId={bookId} initialNotes={initialNotes} concepts={concepts} />
  )
}
