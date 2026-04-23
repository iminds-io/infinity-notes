import React, {useEffect, useRef, useState} from 'react'
import {Note, NotePreview} from '../interfaces/note'
import {
  NoteBrowserItemWidthWithoutCollapsed,
  NotesBrowserItem,
} from './notes-browser-item'
import {getCachedNote} from '../api/cache'
import {useNavigate} from 'react-router-dom'
import {noteStackUrl} from '../helpers/note-url'

interface Props {
  bookId: string
  initialNotes?: Note[]
  concepts?: NotePreview[]
}

export const NotesBrowser: React.FC<Props> = ({
  bookId,
  initialNotes = [],
  concepts = [],
}) => {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement | null>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [viewNotes, setViewNotes] = useState<Note[]>(initialNotes)

  useEffect(() => {
    setViewNotes(initialNotes)
  }, [initialNotes])

  const onClickBacklink = async (
    event: React.MouseEvent,
    path: string,
    index: number,
  ) => {
    event.preventDefault()

    const appendNote = await getCachedNote(bookId, path)
    if (!appendNote) return
    if (viewNotes.map((note) => note.path).includes(appendNote.path)) return

    const newNotes = [...viewNotes.slice(0, index + 1), appendNote]
    setViewNotes(newNotes)
    navigate(noteStackUrl(bookId, newNotes.map((note) => note.path)), {replace: true})
  }

  const scrollToIndex = (index: number) => {
    ref.current?.children[index]?.scrollIntoView?.({
      block: 'start',
      inline: 'start',
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToIndex(viewNotes.length - 1)
  }, [viewNotes])

  return (
    <div
      ref={ref}
      className="browser flex-1 flex overflow-x-auto overflow-y-hidden"
      onScroll={() => setScrollLeft(ref.current?.scrollLeft || 0)}
    >
      {viewNotes.map((note, index) => (
        <NotesBrowserItem
          key={index + note.path}
          bookId={bookId}
          index={index}
          note={note}
          concepts={concepts}
          collapsed={scrollLeft > (index + 1) * NoteBrowserItemWidthWithoutCollapsed - 60}
          overlay={scrollLeft > (index - 1) * NoteBrowserItemWidthWithoutCollapsed}
          onClickBacklink={(event, path) => onClickBacklink(event, path, index)}
        />
      ))}
    </div>
  )
}
