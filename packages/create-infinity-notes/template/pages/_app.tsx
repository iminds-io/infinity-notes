import '../styles/globals.css'
import type {AppProps} from 'next/app'
import Head from 'next/head'

function MyApp({Component, pageProps}: AppProps) {
  return (
    <>
      <Head>
        <title>__SITE_TITLE__</title>

        <meta
          name="description"
          content="__SITE_DESCRIPTION__"
        />
        <meta
          name="og:description"
          content="__SITE_DESCRIPTION__"
        />
        <meta name="og:title" content="__SITE_TITLE__" />
        <meta name="apple-mobile-web-app-title" content="__SITE_TITLE__" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
