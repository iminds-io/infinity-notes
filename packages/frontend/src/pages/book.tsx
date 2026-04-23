import {useParams} from 'react-router-dom'
import {BookNotesPage} from './book-notes-page'

export const BookPage = () => {
  const {bookId} = useParams()

  if (!bookId) return null

  return <BookNotesPage bookId={bookId} notePaths={['Welcome']} />
}
