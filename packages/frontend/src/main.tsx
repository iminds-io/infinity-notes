import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './styles.css'
import {BookSelectorPage} from './pages/home'
import {BookPage} from './pages/book'
import {NotePage} from './pages/note'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookSelectorPage />} />
        <Route path="/books/:bookId" element={<BookPage />} />
        <Route path="/books/:bookId/*" element={<NotePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
