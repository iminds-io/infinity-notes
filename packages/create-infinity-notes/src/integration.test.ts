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
        __BOOK_ID__: 'test-book',
        __BOOK_TITLE__: 'Test Book',
        __BOOK_AUTHORS_JSON__: '["Test Author"]',
        __BOOK_AUTHORS_TEXT__: 'Test Author',
        __BOOK_DESCRIPTION__: 'A test book note set',
        __R2_PREFIX__: 'content/books',
      },
    )

    // Key files exist
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'meta.json'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'notes/Welcome.md'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'notes/About.md'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'notes/concepts/.gitkeep'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'notes/threads/.gitkeep'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'upload.sh'))).toBe(true)
    expect(fs.existsSync(path.join(OUTPUT_DIR, 'wrangler.toml'))).toBe(true)

    // Interpolation worked
    const meta = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'meta.json'), 'utf8'))
    expect(meta).toEqual({
      id: 'test-book',
      title: 'Test Book',
      authors: ['Test Author'],
      description: 'A test book note set',
    })

    const welcome = fs.readFileSync(path.join(OUTPUT_DIR, 'notes/Welcome.md'), 'utf8')
    expect(welcome).toContain('Test Book')

    const upload = fs.readFileSync(path.join(OUTPUT_DIR, 'upload.sh'), 'utf8')
    expect(upload).toContain('BOOK_ID="${1:-test-book}"')
    expect(upload).toContain('R2_PREFIX="${INFINITY_NOTES_R2_PREFIX:-content/books}"')
    expect(upload).toContain('wrangler r2 object put --remote')
    expect(upload).toContain('$BUCKET/$R2_PREFIX/$BOOK_ID/meta.json')
    expect(fs.statSync(path.join(OUTPUT_DIR, 'upload.sh')).mode & 0o111).toBeTruthy()

    const wrangler = fs.readFileSync(path.join(OUTPUT_DIR, 'wrangler.toml'), 'utf8')
    expect(wrangler).toContain('R2_PREFIX = "content/books"')

    // No leftover placeholders anywhere
    const allFiles = getAllFiles(OUTPUT_DIR)
    for (const file of allFiles.filter(isTextFile)) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content, `Leftover placeholder in ${file}`).not.toMatch(
        /__BOOK_ID__|__BOOK_TITLE__|__BOOK_AUTHORS_JSON__|__BOOK_AUTHORS_TEXT__|__BOOK_DESCRIPTION__|__R2_PREFIX__/,
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
