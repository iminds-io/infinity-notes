// ABOUTME: CLI entry point for create-infinity-notes scaffolding tool.
// ABOUTME: Prompts for book metadata and copies a content-only book template.
import {intro, outro, text, spinner, isCancel, cancel} from '@clack/prompts'
import path from 'path'
import {copyTemplate} from './copy-template'

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const parseAuthors = (value: string) => {
  return value
    .split(',')
    .map((author) => author.trim())
    .filter(Boolean)
}

async function main() {
  const args = process.argv.slice(2)
  const dirArg = args[0]

  intro('create-infinity-notes')

  const bookTitle = await text({
    message: 'Book title?',
    defaultValue: 'My Book',
    placeholder: 'My Book',
  })
  if (isCancel(bookTitle)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const defaultBookId = dirArg || slugify(String(bookTitle)) || 'my-book'
  const bookId = await text({
    message: 'Book id?',
    defaultValue: defaultBookId,
    placeholder: defaultBookId,
  })
  if (isCancel(bookId)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const authors = await text({
    message: 'Authors? (comma-separated)',
    defaultValue: '',
    placeholder: 'Author One, Author Two',
  })
  if (isCancel(authors)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const description = await text({
    message: 'Book description?',
    defaultValue: 'A networked note set',
    placeholder: 'A networked note set',
  })
  if (isCancel(description)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const r2Prefix = await text({
    message: 'R2 key prefix?',
    defaultValue: 'books',
    placeholder: 'books',
  })
  if (isCancel(r2Prefix)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const authorList = parseAuthors(String(authors))
  const targetDir = path.resolve(process.cwd(), String(bookId))
  const templateDir = path.join(__dirname, '..', 'template')

  const s = spinner()

  s.start('Copying template')
  await copyTemplate(templateDir, targetDir, {
    __BOOK_ID__: String(bookId),
    __BOOK_TITLE__: String(bookTitle),
    __BOOK_AUTHORS_JSON__: JSON.stringify(authorList),
    __BOOK_AUTHORS_TEXT__: authorList.join(', ') || 'Unknown author',
    __BOOK_DESCRIPTION__: String(description),
    __R2_PREFIX__: String(r2Prefix).replace(/^\/+|\/+$/g, '') || 'books',
  })
  s.stop('Template copied')

  outro(`Done! Next steps:\n\n  cd ${bookId}\n  edit notes/\n  ./upload.sh ${bookId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
