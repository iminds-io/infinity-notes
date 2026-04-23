const basename = (notePath: string): string => {
  return notePath.split('/').pop() || notePath
}

export const resolveNotePath = (
  linkName: string,
  allNotes: Array<{path: string}>,
): string | null => {
  const exact = allNotes.find((note) => note.path === linkName)
  if (exact) return exact.path

  const linkBasename = basename(linkName)
  const matches = allNotes.filter((note) => basename(note.path) === linkBasename)

  if (matches.length === 1) return matches[0].path
  if (matches.length > 1) {
    console.warn(
      `Ambiguous link "${linkName}" matches: ${matches
        .map((note) => note.path)
        .join(', ')}`,
    )
    return matches[0].path
  }

  return null
}
