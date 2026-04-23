// ABOUTME: Copies a template directory tree to a target location.
// ABOUTME: Interpolates placeholder tokens in text files; binary files are copied as-is.
import fs from 'fs/promises'
import path from 'path'
import {interpolate} from './interpolate'

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css',
  '.html', '.yml', '.yaml', '.toml', '.txt', '.mjs', '.cjs', '.sh',
])

function isTextFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return TEXT_EXTENSIONS.has(ext) || ext === ''
}

export async function copyTemplate(
  sourceDir: string,
  targetDir: string,
  variables: Record<string, string>,
): Promise<void> {
  await fs.mkdir(targetDir, {recursive: true})

  const entries = await fs.readdir(sourceDir, {withFileTypes: true})

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await copyTemplate(sourcePath, targetPath, variables)
    } else if (isTextFile(entry.name)) {
      const content = await fs.readFile(sourcePath, 'utf8')
      await fs.writeFile(targetPath, interpolate(content, variables))
      if (entry.name.endsWith('.sh')) {
        await fs.chmod(targetPath, 0o755)
      }
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}
