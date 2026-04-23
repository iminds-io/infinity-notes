import {useEffect, useState} from 'react'
import {getCachedNote, getCachedPreviews, populateNoteCache} from '../api/cache'
import {Header} from '../components/header'
import {Layout} from '../components/layout'
import {Notes} from '../components/notes'
import {Note, NotePreview} from '../interfaces/note'

interface Props {
  bookId: string
  notePaths: string[]
}

export const BookNotesPage: React.FC<Props> = ({bookId, notePaths}) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [previews, setPreviews] = useState<NotePreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    Promise.all([
      getCachedPreviews(bookId),
      Promise.all(notePaths.map((notePath) => getCachedNote(bookId, notePath))),
    ])
      .then(([nextPreviews, nextNotes]) => {
        if (cancelled) return
        const loadedNotes = nextNotes.filter((note): note is Note => Boolean(note))
        populateNoteCache(bookId, loadedNotes)
        setPreviews(nextPreviews)
        setNotes(loadedNotes)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bookId, notePaths.join('|')])

  const concepts = previews
    .filter((preview) => preview.type === 'concept')
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <Layout>
      <Header title={bookId} bookId={bookId} />
      {loading ? (
        <div className="flex-1 md:p-8 p-5 text-gray-500">Loading notes...</div>
      ) : (
        <Notes bookId={bookId} initialNotes={notes} concepts={concepts} />
      )}
    </Layout>
  )
}
