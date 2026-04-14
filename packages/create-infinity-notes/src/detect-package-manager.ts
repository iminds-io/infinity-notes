// ABOUTME: Detects which package manager invoked the CLI.
// ABOUTME: Reads npm_config_user_agent to identify npm, yarn, pnpm, or bun.
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? ''

  if (userAgent.startsWith('yarn')) return 'yarn'
  if (userAgent.startsWith('pnpm')) return 'pnpm'
  if (userAgent.startsWith('bun')) return 'bun'

  return 'npm'
}
