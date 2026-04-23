import {Transition} from '@headlessui/react'
import {getCachedNote} from '../api/cache'
import {Note} from '../interfaces/note'
import React, {useEffect, useState} from 'react'
import {NoteMarkdown} from './note-markdown'
import {PortalBody} from './portal-body'
import {usePopper} from 'react-popper'

interface Props {
  bookId: string
  path: string
  offset?: number
  referenceElement: HTMLElement | null
}

const truncate = (value: string, length: number) => {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value
}

export const NotePreviewPopover: React.FC<Props> = ({
  bookId,
  path,
  referenceElement,
  offset = 15,
}) => {
  const [note, setNote] = useState<Note | undefined | null>()
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)

  const {styles, attributes} = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    placement: 'bottom-start',
    modifiers: [
      {name: 'offset', options: {offset: [offset, offset]}},
      {name: 'arrow', options: {element: arrowElement}},
    ],
  })

  useEffect(() => {
    getCachedNote(bookId, path).then(setNote)
  }, [bookId, path])

  return (
    <PortalBody>
      <Transition
        appear={true}
        show={!!note}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          ref={setPopperElement}
          className="note-preview-popover"
          style={styles.popper}
          {...attributes.popper}
        >
          <div
            ref={setArrowElement}
            style={styles.arrow}
            className="note-preview-popover-arrow"
          />
          {note && (
            <NoteMarkdown
              bookId={bookId}
              markdown={truncate(note.snippet, 390)}
              size="sm"
            />
          )}
        </div>
      </Transition>
    </PortalBody>
  )
}
