import '@testing-library/jest-dom/vitest'
import {cleanup} from '@testing-library/react'
import {afterEach} from 'vitest'

afterEach(() => {
  cleanup()
})

const listeners = new Set<(event: MediaQueryListEvent) => void>()

const queryMatches = (query: string): boolean => {
  const minWidth = /min-width:\s*(\d+)px/.exec(query)?.[1]
  if (minWidth) return window.innerWidth >= Number(minWidth)
  return false
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: queryMatches(query),
      media: query,
      onchange: null,
      addEventListener: (
        _event: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.add(listener)
      },
      removeEventListener: (
        _event: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(listener)
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener)
      },
      removeListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener)
      },
      dispatchEvent: () => true,
    }) as MediaQueryList,
})

window.addEventListener('resize', () => {
  for (const listener of listeners) {
    listener({matches: window.innerWidth >= 768} as MediaQueryListEvent)
  }
})
