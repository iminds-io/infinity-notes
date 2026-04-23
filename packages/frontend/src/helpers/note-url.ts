const encodePathSegments = (path: string): string => {
  return path.split('/').map(encodeURIComponent).join('/')
}

export const singleNoteUrl = (bookId: string, notePath: string): string => {
  return `/books/${bookId}/${encodePathSegments(notePath)}`
}

export const noteStackUrl = (bookId: string, notePaths: string[]): string => {
  const [firstPath, ...stackedPaths] = notePaths
  const url = new URL(singleNoteUrl(bookId, firstPath), window.location.origin)

  for (const stackedPath of stackedPaths) {
    url.searchParams.append('stacked', stackedPath)
  }

  return url.pathname + url.search
}
