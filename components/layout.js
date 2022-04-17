import Footer from '@/components/layouts/footer'
import Head from 'next/head'
import Header from '@/components/layouts/header'
import Link from 'next/link'
import styles from '@/styles/modules/components/layouts/layout.module.scss'

export default function Layout({ children, home}) {
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="T.Kengo's blog."
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className={styles.container}>
        <Header />

        <main>{children}</main>

        { !home && <Footer /> }
      </div>
    </>
  )
}
