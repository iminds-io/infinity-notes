import {useParams, useSearchParams} from 'react-router-dom'
import {BookNotesPage} from './book-notes-page'

export const NotePage = () => {
  const {bookId, '*': notePath} = useParams()
  const [searchParams] = useSearchParams()

  if (!bookId || !notePath) return null

  return (
    <BookNotesPage
      bookId={bookId}
      notePaths={[notePath, ...searchParams.getAll('stacked')]}
    />
  )
}
