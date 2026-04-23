import {Note, NotePreview} from '../interfaces/note'
import React from 'react'

interface Props {
  note: Note
  onClickBacklink?: (event: React.MouseEvent, path: string) => void
}

const currentNotePreview = (note: Note): NotePreview => ({
  path: note.path,
  title: note.title,
  snippet: note.snippet,
  type: note.type,
})

export const ThreadBreadcrumb: React.FC<Props> = ({note, onClickBacklink}) => {
  if (note.type !== 'thread' || !note.breadcrumb?.length) return null

  const breadcrumb = [...note.breadcrumb, currentNotePreview(note)]

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
      {breadcrumb.map((item, index) => {
        const isCurrent = index === breadcrumb.length - 1

        return (
          <React.Fragment key={item.path}>
            {index > 0 && <span className="text-gray-300">&gt;</span>}
            {isCurrent ? (
              <span className="font-medium text-gray-600">{item.title}</span>
            ) : (
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700"
                onClick={(event) => onClickBacklink?.(event, item.path)}
              >
                {item.title}
              </button>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
