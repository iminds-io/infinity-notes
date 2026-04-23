import {Note} from '../interfaces/note'
import React from 'react'
import {NoteMarkdown} from './note-markdown'

interface Props {
  bookId: string
  note: Note
  onClickBacklink?: (event: React.MouseEvent, path: string) => void
}

export const NoteLinks: React.FC<Props> = ({bookId, note, onClickBacklink}) => {
  if (!note.linkedFromNotes?.length) return null

  return (
    <div className="bg-gray-100 rounded-md px-6 py-5">
      <h3 className="text-gray-600 text-lg font-medium">Links to this note</h3>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-5 mt-3">
        {note.linkedFromNotes.map((linkedNote) => (
          <div
            key={linkedNote.path}
            onClick={(event) => onClickBacklink?.(event, linkedNote.path)}
            className="text-gray-600 cursor-pointer block space-y-2"
          >
            <h3 className="text-sm font-medium">{linkedNote.title}</h3>
            <NoteMarkdown
              bookId={bookId}
              onClickBacklink={onClickBacklink}
              markdown={linkedNote.snippet}
              size="sm"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
