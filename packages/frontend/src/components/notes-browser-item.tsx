import clsx from 'clsx'
import React from 'react'
import {Note, NotePreview} from '../interfaces/note'
import {NoteMarkdown} from './note-markdown'
import {Transition} from '@headlessui/react'
import {NoteLinks} from './note-links'
import {ConceptDictionary} from './concept-dictionary'
import {ThreadBreadcrumb} from './thread-breadcrumb'

interface Props {
  bookId: string
  note: Note
  index: number
  concepts?: NotePreview[]
  onClickBacklink?: (event: React.MouseEvent, path: string) => void
  collapsed?: boolean
  overlay?: boolean
}

export const NoteBrowserItemWidth = 625
export const NoteBrowserItemCollapsedWidth = 40
export const NoteBrowserItemWidthWithoutCollapsed =
  NoteBrowserItemWidth - NoteBrowserItemCollapsedWidth

const containsHangul = (value: string): boolean => {
  return /\p{Script=Hangul}/u.test(value)
}

export const NotesBrowserItem: React.FC<Props> = ({
  bookId,
  note,
  onClickBacklink,
  index,
  concepts = [],
  collapsed = false,
  overlay = false,
}) => {
  return (
    <div
      className={clsx(
        'flex-none flex flex-col sticky bg-white border-r border-gray-100 overflow-y-auto',
        overlay && 'shadow-left-xl',
      )}
      style={{
        left: index * 40,
        width: NoteBrowserItemWidth,
        right: -1 * NoteBrowserItemWidth - NoteBrowserItemCollapsedWidth,
      }}
    >
      <Transition
        appear={true}
        show={collapsed}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={clsx(
            'absolute inset-0 right-auto font-medium text-gray-600 text-md w-[40px] flex items-center py-10',
            containsHangul(note.title)
              ? 'writing-vertical-upright'
              : 'writing-vertical-latin',
          )}
        >
          {note.type && <span className="text-xs text-gray-400 mr-1">{note.type}</span>}
          {note.title}
        </div>
      </Transition>

      <Transition
        appear={true}
        show={!collapsed}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex-1 flex-col px-8 py-8 space-y-8">
          <ThreadBreadcrumb note={note} onClickBacklink={onClickBacklink} />
          {note.type && (
            <span className="text-xs font-medium text-gray-400 uppercase">
              {note.type}
            </span>
          )}
          <NoteMarkdown
            bookId={bookId}
            markdown={note.markdown}
            onClickBacklink={onClickBacklink}
          />
          <NoteLinks bookId={bookId} note={note} onClickBacklink={onClickBacklink} />
          <ConceptDictionary concepts={concepts} onClickBacklink={onClickBacklink} />
        </div>
      </Transition>
    </div>
  )
}
