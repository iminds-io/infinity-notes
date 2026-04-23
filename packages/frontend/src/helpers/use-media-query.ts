import {useEffect, useState} from 'react'

const matchesQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => matchesQuery(query))

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = (event?: MediaQueryListEvent) => {
      setMatches(event?.matches ?? window.matchMedia(query).matches)
    }

    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}
