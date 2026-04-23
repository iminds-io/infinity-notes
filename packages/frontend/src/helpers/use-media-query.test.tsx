import {act, renderHook} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {useMediaQuery} from './use-media-query'

const resizeTo = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('useMediaQuery', () => {
  it('should update when viewport crosses the md breakpoint', () => {
    resizeTo(390)
    const {result} = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)

    act(() => resizeTo(900))
    expect(result.current).toBe(true)

    act(() => resizeTo(390))
    expect(result.current).toBe(false)
  })
})
