import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fetchBooks} from '../api/client'
import {BookMeta} from '../interfaces/note'
import {Header} from '../components/header'
import {Layout} from '../components/layout'

export const BookSelectorPage = () => {
  const [books, setBooks] = useState<BookMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl space-y-8 md:p-8 p-5">
          <section className="max-w-4xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Compression with Fidelity Toward Clarity
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-gray-900 md:text-5xl">
              Refine your thoughts and beliefs against humanity's clearest
              minds.
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-gray-600">
              Oh My Beliefs helps you challenge what you think you know against
              the best thinkers of humanity. Each note compresses a book's ideas
              with fidelity, preserving detail where it matters so the thought
              can arrive with clarity.
            </p>
          </section>

          <section aria-labelledby="book-catalog-heading" className="space-y-4">
            <h2 id="book-catalog-heading" className="text-2xl font-semibold text-gray-800">
              Book Catalog
            </h2>
            <p className="max-w-2xl text-gray-600">
              Start with a book, follow its argument threads, then use the
              concept dictionary to test one belief through many connected
              lenses.
            </p>
          {loading ? <p className="text-gray-500">Loading books...</p> : null}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="border border-gray-200 rounded-md p-5 hover:border-blue-300"
              >
                <h3 className="text-lg font-medium text-gray-800">{book.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{book.authors.join(', ')}</p>
                <p className="text-gray-600 mt-3">{book.description}</p>
                <p className="text-sm text-gray-400 mt-4">{book.noteCount} notes</p>
              </Link>
            ))}
          </div>
          </section>
        </div>
      </main>
    </Layout>
  )
}
