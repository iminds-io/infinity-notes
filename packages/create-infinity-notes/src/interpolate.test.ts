// ABOUTME: Tests for the template string interpolation utility.
// ABOUTME: Verifies placeholder replacement logic used during scaffolding.
import {describe, it, expect} from 'vitest'
import {interpolate} from './interpolate'

describe('interpolate', () => {
  it('replaces a single placeholder', () => {
    const result = interpolate('Hello __NAME__!', {__NAME__: 'World'})
    expect(result).toBe('Hello World!')
  })

  it('replaces multiple different placeholders', () => {
    const result = interpolate('__TITLE__ by __AUTHOR__', {
      __TITLE__: 'My Site',
      __AUTHOR__: 'Alice',
    })
    expect(result).toBe('My Site by Alice')
  })

  it('replaces all occurrences of the same placeholder', () => {
    const result = interpolate('__X__ and __X__', {__X__: 'yes'})
    expect(result).toBe('yes and yes')
  })

  it('returns the string unchanged when no placeholders match', () => {
    const result = interpolate('no placeholders here', {__NOPE__: 'value'})
    expect(result).toBe('no placeholders here')
  })

  it('handles empty values', () => {
    const result = interpolate('by __AUTHOR__', {__AUTHOR__: ''})
    expect(result).toBe('by ')
  })

  it('handles empty variable map', () => {
    const result = interpolate('__KEEP_THIS__', {})
    expect(result).toBe('__KEEP_THIS__')
  })
})
