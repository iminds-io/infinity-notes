// ABOUTME: Tests for the template directory copy utility.
// ABOUTME: Verifies file copying, directory recursion, and placeholder interpolation in files.
import {describe, it, expect, beforeEach, afterEach} from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import {copyTemplate} from './copy-template'

describe('copyTemplate', () => {
  let tempDir: string
  let sourceDir: string
  let targetDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'copy-template-test-'))
    sourceDir = path.join(tempDir, 'source')
    targetDir = path.join(tempDir, 'target')
    await fs.mkdir(sourceDir, {recursive: true})
  })

  afterEach(async () => {
    await fs.rm(tempDir, {recursive: true, force: true})
  })

  it('copies a flat directory', async () => {
    await fs.writeFile(path.join(sourceDir, 'file.txt'), 'hello')
    await copyTemplate(sourceDir, targetDir, {})
    const content = await fs.readFile(path.join(targetDir, 'file.txt'), 'utf8')
    expect(content).toBe('hello')
  })

  it('copies nested directories', async () => {
    await fs.mkdir(path.join(sourceDir, 'sub'), {recursive: true})
    await fs.writeFile(path.join(sourceDir, 'sub', 'nested.txt'), 'deep')
    await copyTemplate(sourceDir, targetDir, {})
    const content = await fs.readFile(path.join(targetDir, 'sub', 'nested.txt'), 'utf8')
    expect(content).toBe('deep')
  })

  it('interpolates placeholders in text files', async () => {
    await fs.writeFile(
      path.join(sourceDir, 'readme.md'),
      '# __SITE_TITLE__\n\n__SITE_DESCRIPTION__',
    )
    await copyTemplate(sourceDir, targetDir, {
      __SITE_TITLE__: 'My Notes',
      __SITE_DESCRIPTION__: 'A great site',
    })
    const content = await fs.readFile(path.join(targetDir, 'readme.md'), 'utf8')
    expect(content).toBe('# My Notes\n\nA great site')
  })

  it('copies binary files without interpolation', async () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]) // PNG header bytes
    await fs.writeFile(path.join(sourceDir, 'image.png'), buffer)
    await copyTemplate(sourceDir, targetDir, {__NOPE__: 'value'})
    const content = await fs.readFile(path.join(targetDir, 'image.png'))
    expect(content.equals(buffer)).toBe(true)
  })

  it('creates the target directory if it does not exist', async () => {
    const deepTarget = path.join(targetDir, 'a', 'b', 'c')
    await fs.writeFile(path.join(sourceDir, 'file.txt'), 'hi')
    await copyTemplate(sourceDir, deepTarget, {})
    const content = await fs.readFile(path.join(deepTarget, 'file.txt'), 'utf8')
    expect(content).toBe('hi')
  })
})
