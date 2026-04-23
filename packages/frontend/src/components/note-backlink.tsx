import React, {MouseEvent} from 'react'
import {NotePreview} from './note-preview'

interface Props {
  bookId: string
  path: string
  onClick?: (event: MouseEvent) => void
}

export const NoteBacklink: React.FC<Props> = ({bookId, path, onClick}) => {
  return (
    <NotePreview bookId={bookId} path={path}>
      <a className="text-blue-500" href={path} onClick={onClick}>
        {path}
      </a>
    </NotePreview>
  )
}
