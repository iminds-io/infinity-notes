import React, {useState} from 'react'
import {NotePreviewPopover} from './note-preview-popover'

interface Props {
  bookId: string
  path: string
}

export const NotePreview: React.FC<React.PropsWithChildren<Props>> = ({
  bookId,
  children,
  path,
}) => {
  const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <NotePreviewPopover
          bookId={bookId}
          referenceElement={referenceElement}
          path={path}
        />
      )}
      <span
        ref={setReferenceElement}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>
    </>
  )
}
