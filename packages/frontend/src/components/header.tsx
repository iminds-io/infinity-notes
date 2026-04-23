import {Link} from 'react-router-dom'

interface Props {
  title?: string
  bookId?: string
}

export const Header: React.FC<Props> = ({title = 'Oh My Beliefs', bookId}) => {
  return (
    <div className="flex-none h-[60px] space-x-5 flex items-center justify-between border-b select-none md:px-8 px-5">
      <div className="flex items-center gap-3 min-w-0">
        {bookId ? (
          <Link
            to="/"
            className="md:text-xl text-sm font-medium text-gray-900 shrink-0"
          >
            Oh My Beliefs
          </Link>
        ) : null}
        <h1 className="md:text-xl text-sm font-medium truncate">
          <Link to={bookId ? `/books/${bookId}` : '/'}>{title}</Link>
        </h1>
      </div>
      {bookId ? (
        <h3 className="md:text-base text-sm font-normal">
          <Link to={`/books/${bookId}/About`}>About</Link>
        </h3>
      ) : null}
    </div>
  )
}
