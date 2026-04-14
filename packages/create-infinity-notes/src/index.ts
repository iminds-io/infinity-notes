// ABOUTME: CLI entry point for create-infinity-notes scaffolding tool.
// ABOUTME: Prompts for project metadata, copies the template, and installs dependencies.
import {intro, outro, text, spinner, isCancel, cancel} from '@clack/prompts'
import path from 'path'
import {execSync} from 'child_process'
import {copyTemplate} from './copy-template'
import {detectPackageManager} from './detect-package-manager'

async function main() {
  const args = process.argv.slice(2)
  const dirArg = args[0]

  intro('create-infinity-notes')

  const projectName = await text({
    message: 'Project name?',
    defaultValue: dirArg || 'my-notes',
    placeholder: dirArg || 'my-notes',
  })
  if (isCancel(projectName)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const siteTitle = await text({
    message: 'Site title?',
    defaultValue: 'My Notes',
    placeholder: 'My Notes',
  })
  if (isCancel(siteTitle)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const siteDescription = await text({
    message: 'Site description?',
    defaultValue: 'A networked notes site',
    placeholder: 'A networked notes site',
  })
  if (isCancel(siteDescription)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const authorName = await text({
    message: 'Author name? (optional)',
    defaultValue: '',
    placeholder: 'optional',
  })
  if (isCancel(authorName)) {
    cancel('Cancelled.')
    process.exit(0)
  }

  const targetDir = path.resolve(process.cwd(), String(projectName))
  const templateDir = path.join(__dirname, '..', 'template')

  const s = spinner()

  s.start('Copying template')
  await copyTemplate(templateDir, targetDir, {
    __PROJECT_NAME__: String(projectName),
    __SITE_TITLE__: String(siteTitle),
    __SITE_DESCRIPTION__: String(siteDescription),
    __AUTHOR_NAME__: String(authorName),
  })
  s.stop('Template copied')

  s.start('Installing dependencies')
  const pm = detectPackageManager()
  try {
    execSync(`${pm} install`, {cwd: targetDir, stdio: 'pipe'})
    s.stop('Dependencies installed')
  } catch {
    s.stop(`Could not auto-install. Run \`${pm} install\` manually.`)
  }

  outro(`Done! Next steps:\n\n  cd ${projectName}\n  ${pm} run dev`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
