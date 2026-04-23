import React, {useEffect, useRef, useState} from 'react'
import {Note, NotePreview} from '../interfaces/note'
import {NoteMarkdown} from './note-markdown'
import {NoteLinks} from './note-links'
import {useNavigate} from 'react-router-dom'
import {ConceptDictionary} from './concept-dictionary'
import {ThreadBreadcrumb} from './thread-breadcrumb'
import {getCachedNote} from '../api/cache'
import {noteStackUrl} from '../helpers/note-url'

interface Props {
  bookId: string
  initialNotes?: Note[]
  concepts?: NotePreview[]
}

export const NotesFallback: React.FC<Props> = ({
  bookId,
  initialNotes = [],
  concepts = [],
}) => {
  const navigate = useNavigate()
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [viewNotes, setViewNotes] = useState<Note[]>(initialNotes)

  useEffect(() => {
    setViewNotes(initialNotes)
  }, [initialNotes])

  if (!viewNotes.length) return null

  const scrollToNote = (path: string) => {
    sectionRefs.current[path]?.scrollIntoView?.({
      block: 'start',
      behavior: 'smooth',
    })
  }

  const onClickBacklink = async (
    event: React.MouseEvent,
    path: string,
    index: number,
  ) => {
    event.preventDefault()

    const appendNote = await getCachedNote(bookId, path)
    if (!appendNote) return

    const existingIndex = viewNotes.findIndex((note) => note.path === appendNote.path)
    if (existingIndex >= 0) {
      scrollToNote(appendNote.path)
      return
    }

    const newNotes = [...viewNotes.slice(0, index + 1), appendNote]
    setViewNotes(newNotes)
    navigate(noteStackUrl(bookId, newNotes.map((note) => note.path)))

    requestAnimationFrame(() => scrollToNote(appendNote.path))
  }

  return (
    <div className="fallback flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-8">
      <div className="space-y-10">
        {viewNotes.map((note, index) => (
          <section
            key={`${index}-${note.path}`}
            data-note-path={note.path}
            ref={(element) => {
              sectionRefs.current[note.path] = element
            }}
            className="scroll-mt-5 border-b border-gray-100 pb-10 last:border-b-0 last:pb-0"
          >
            <ThreadBreadcrumb
              note={note}
              onClickBacklink={(event, path) => onClickBacklink(event, path, index)}
            />
            {note.type && (
              <span className="mt-4 inline-block text-xs font-medium text-gray-400 uppercase">
                {note.type}
              </span>
            )}
            <NoteMarkdown
              bookId={bookId}
              markdown={note.markdown}
              onClickBacklink={(event, path) => onClickBacklink(event, path, index)}
            />
            <NoteLinks
              bookId={bookId}
              note={note}
              onClickBacklink={(event, path) => onClickBacklink(event, path, index)}
            />
          </section>
        ))}
        <ConceptDictionary
          concepts={concepts}
          onClickBacklink={(event, path) =>
            onClickBacklink(event, path, viewNotes.length - 1)
          }
        />
      </div>
    </div>
  )
}
