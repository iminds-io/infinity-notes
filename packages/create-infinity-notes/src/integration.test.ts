// ABOUTME: Integration test verifying end-to-end template copy and interpolation.
// ABOUTME: Uses copyTemplate directly from TypeScript source against the real template directory.
import {describe, it, expect, afterAll} from 'vitest'
import path from 'path'
import fs from 'fs'
import {copyTemplate} from './copy-template'

const OUTPUT_DIR = '/tmp/scaffold-test-integration'

afterAll(() => {
  fs.rmSync(OUTPUT_DIR, {recursive: true, force: true})
})

describe('integration: copyTemplate with real template', () => {
  it('copies template and interpolates all placeholders', async () => {
    await copyTemplate(
      path.join(__dirname, '..', 'template'),
      OUTPUT_DIR,
      {
        __PROJECT_NAME__: 'test-scaffold',
        __SITE_TITLE__: 'Test Notes',
        __SITE_DESCRIPTION__: 'A test notes site',
        __AUTHOR_NAME__: 'Test Author',
      },
    )

    // Key files exist
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'package.json'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'pages/_app.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'app/components/header.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'notes/Welcome.md'))).toBe(true)

    // Interpolation worked
    const pkg = fs.readFileSync(path.join(OUTPUT_DIR, 'package.json'), 'utf8')
    expect(pkg).toContain('"name": "test-scaffold"')

    const app = fs.readFileSync(path.join(OUTPUT_DIR, 'pages/_app.tsx'), 'utf8')
    expect(app).toContain('Test Notes')
    expect(app).toContain('A test notes site')

    const header = fs.readFileSync(path.join(OUTPUT_DIR, 'app/components/header.tsx'), 'utf8')
    expect(header).toContain('Test Notes')

    const welcome = fs.readFileSync(path.join(OUTPUT_DIR, 'notes/Welcome.md'), 'utf8')
    expect(welcome).toContain('Test Notes')

    // No leftover placeholders anywhere
    const allFiles = getAllFiles(OUTPUT_DIR)
    for (const file of allFiles.filter(isTextFile)) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content, `Leftover placeholder in ${file}`).not.toMatch(
        /__PROJECT_NAME__|__SITE_TITLE__|__SITE_DESCRIPTION__|__AUTHOR_NAME__/,
      )
    }
  })
})

const TEXT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css',
  '.html', '.yml', '.yaml', '.toml', '.txt', '.mjs', '.cjs',
])

function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  return TEXT_EXTS.has(ext) || ext === ''
}

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, {withFileTypes: true})
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? getAllFiles(fullPath) : [fullPath]
  })
}
