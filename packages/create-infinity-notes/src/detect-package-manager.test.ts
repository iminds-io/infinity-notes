// ABOUTME: Tests for the package manager detection utility.
// ABOUTME: Verifies correct detection from npm_config_user_agent environment variable.
import {describe, it, expect, afterEach} from 'vitest'
import {detectPackageManager} from './detect-package-manager'

describe('detectPackageManager', () => {
  const originalUserAgent = process.env.npm_config_user_agent

  afterEach(() => {
    if (originalUserAgent === undefined) {
      delete process.env.npm_config_user_agent
    } else {
      process.env.npm_config_user_agent = originalUserAgent
    }
  })

  it('detects npm', () => {
    process.env.npm_config_user_agent = 'npm/10.2.0 node/v20.10.0'
    expect(detectPackageManager()).toBe('npm')
  })

  it('detects yarn', () => {
    process.env.npm_config_user_agent = 'yarn/1.22.19 npm/? node/v20.10.0'
    expect(detectPackageManager()).toBe('yarn')
  })

  it('detects pnpm', () => {
    process.env.npm_config_user_agent = 'pnpm/8.15.0 npm/? node/v20.10.0'
    expect(detectPackageManager()).toBe('pnpm')
  })

  it('detects bun', () => {
    process.env.npm_config_user_agent = 'bun/1.0.25 npm/?'
    expect(detectPackageManager()).toBe('bun')
  })

  it('defaults to npm when user agent is missing', () => {
    delete process.env.npm_config_user_agent
    expect(detectPackageManager()).toBe('npm')
  })

  it('defaults to npm for unknown user agent', () => {
    process.env.npm_config_user_agent = 'something-else/1.0.0'
    expect(detectPackageManager()).toBe('npm')
  })
})
