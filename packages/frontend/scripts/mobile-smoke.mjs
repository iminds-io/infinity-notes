import {spawn} from 'node:child_process'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

const baseUrl = (
  process.argv.slice(2).find((argument) => /^https?:\/\//.test(argument)) ||
  'http://127.0.0.1:4173'
).replace(/\/+$/, '')
const chromeBin =
  process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const port = 9300 + Math.floor(Math.random() * 500)
const userDataDir = await mkdtemp(join(tmpdir(), 'infinity-notes-mobile-smoke-'))

const chrome = spawn(
  chromeBin,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ],
  {stdio: ['ignore', 'ignore', 'pipe']},
)

const cleanup = async () => {
  chrome.kill('SIGTERM')
  await new Promise((resolve) => setTimeout(resolve, 250))
  await rm(userDataDir, {recursive: true, force: true, maxRetries: 5, retryDelay: 100})
}

const fail = async (message) => {
  console.error(`mobile-smoke: ${message}`)
  await cleanup()
  process.exit(1)
}

const waitForDebugger = async () => {
  const deadline = Date.now() + 10000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  await fail('Chrome debugger did not become available')
}

let commandId = 0

const openPage = async (url) => {
  const target = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
    {method: 'PUT'},
  ).then((response) => response.json())
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  const pending = new Map()

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message)
      pending.delete(message.id)
    }
  })

  await new Promise((resolve) => ws.addEventListener('open', resolve, {once: true}))

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++commandId
      pending.set(id, resolve)
      ws.send(JSON.stringify({id, method, params}))
    })

  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (response.result.exceptionDetails) {
      throw new Error(JSON.stringify(response.result.exceptionDetails))
    }
    return response.result.result.value
  }

  await send('Page.enable')
  await send('Runtime.enable')

  return {send, evaluate, close: () => ws.close()}
}

const routeUrl = (route) => `${baseUrl}${route}`

const routes = [
  '/',
  '/books/surfaces-and-essences',
  '/books/surfaces-and-essences/Welcome?stacked=About',
  '/books/surfaces-and-essences/threads/Analogy%20as%20the%20Core%20of%20Cognition',
  '/books/surfaces-and-essences/concepts/Analogy-Categorization%20Identity',
]

const inspect = async (route, width, height = 844) => {
  const page = await openPage(routeUrl(route))
  await page.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 3,
    mobile: true,
  })
  await page.send('Page.navigate', {url: routeUrl(route)})
  await new Promise((resolve) => setTimeout(resolve, 5000))
  const data = await page.evaluate(`(() => ({
    url: location.href,
    mode: document.querySelector('.browser') ? 'browser' : document.querySelector('.fallback') ? 'fallback' : 'unknown',
    headings: Array.from(document.querySelectorAll('h1')).map((heading) => heading.textContent.trim()),
    text: document.body.innerText,
    scroll: {
      documentWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth
    }
  }))()`)
  page.close()
  return data
}

const assertNoHorizontalOverflow = (route, width, data) => {
  const documentOverflow = data.scroll.documentWidth - data.scroll.clientWidth
  const bodyOverflow = data.scroll.bodyWidth - data.scroll.bodyClientWidth
  if (documentOverflow > 1 || bodyOverflow > 1) {
    throw new Error(
      `${route} overflowed at ${width}px: document +${documentOverflow}, body +${bodyOverflow}`,
    )
  }
}

try {
  chrome.stderr.on('data', () => {})
  await waitForDebugger()

  for (const width of [320, 390, 430]) {
    for (const route of routes) {
      const data = await inspect(route, width)
      assertNoHorizontalOverflow(route, width, data)
      console.log(`ok overflow ${width}px ${route}`)
    }
  }

  const stacked = await inspect(
    '/books/surfaces-and-essences/Welcome?stacked=About',
    390,
  )
  if (
    !stacked.headings.includes('Surfaces and Essences') ||
    !stacked.headings.includes('About These Notes')
  ) {
    throw new Error(`mobile stack did not render both notes: ${stacked.headings.join(', ')}`)
  }
  console.log('ok mobile stacked route renders both notes')

  const clickPage = await openPage(
    routeUrl('/books/surfaces-and-essences/Welcome?stacked=About'),
  )
  await clickPage.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  })
  await clickPage.send('Page.navigate', {
    url: routeUrl('/books/surfaces-and-essences/Welcome?stacked=About'),
  })
  await new Promise((resolve) => setTimeout(resolve, 5000))
  const clickResult = await clickPage.evaluate(`(async () => {
    const link = Array.from(document.querySelectorAll('a')).find((anchor) => anchor.textContent.trim() === 'Analogy as the Core of Cognition')
    if (!link) return {clicked: false, reason: 'link missing', url: location.href, headings: []}
    link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}))
    await new Promise((resolve) => setTimeout(resolve, 2500))
    return {
      clicked: true,
      url: location.href,
      headings: Array.from(document.querySelectorAll('h1')).map((heading) => heading.textContent.trim())
    }
  })()`)
  clickPage.close()
  if (
    !clickResult.clicked ||
    !clickResult.url.includes('stacked=threads%2FAnalogy') ||
    !clickResult.headings.includes('Analogy as the Core of Cognition')
  ) {
    throw new Error(`mobile backlink did not append stack: ${JSON.stringify(clickResult)}`)
  }
  console.log('ok mobile backlink appends to stack')

  const desktopPage = await openPage(
    routeUrl('/books/surfaces-and-essences/Welcome?stacked=About'),
  )
  await desktopPage.send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await desktopPage.send('Page.navigate', {
    url: routeUrl('/books/surfaces-and-essences/Welcome?stacked=About'),
  })
  await new Promise((resolve) => setTimeout(resolve, 5000))
  const desktopMode = await desktopPage.evaluate(
    `document.querySelector('.browser') ? 'browser' : document.querySelector('.fallback') ? 'fallback' : 'unknown'`,
  )
  desktopPage.close()
  if (desktopMode !== 'browser') {
    throw new Error(`desktop route used ${desktopMode} mode`)
  }
  console.log('ok desktop keeps browser mode')

  const dictionaryPage = await openPage(
    routeUrl('/books/surfaces-and-essences/threads/Analogy%20as%20the%20Core%20of%20Cognition'),
  )
  await dictionaryPage.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  })
  await dictionaryPage.send('Page.navigate', {
    url: routeUrl('/books/surfaces-and-essences/threads/Analogy%20as%20the%20Core%20of%20Cognition'),
  })
  await new Promise((resolve) => setTimeout(resolve, 5000))
  const buttonSizes = await dictionaryPage.evaluate(`(() => {
    const dictionaryButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent.trim().startsWith('Concept Dictionary'))
    dictionaryButton?.scrollIntoView()
    dictionaryButton?.click()
    return Array.from(document.querySelectorAll('button'))
      .filter((button) => /^[A-Z]$/.test(button.textContent.trim()))
      .map((button) => {
        const rect = button.getBoundingClientRect()
        return {text: button.textContent.trim(), width: rect.width, height: rect.height}
      })
  })()`)
  dictionaryPage.close()
  const smallButton = buttonSizes.find((button) => button.width < 44 || button.height < 44)
  if (smallButton) {
    throw new Error(`concept dictionary button too small: ${JSON.stringify(smallButton)}`)
  }
  console.log('ok mobile concept dictionary touch targets')
} catch (error) {
  await fail(error instanceof Error ? error.message : String(error))
}

await cleanup()
