import Head from 'next/head'
import Link from 'next/link'
import { FC } from 'react'
import { Footer } from '@/components/layouts/footer'
import { Header } from '@/components/layouts/header'
import { SITE_TITLE } from '@/constants/Sites'
import type { LayoutProps } from '@/types/components/layout'
import styles from '@/styles/modules/components/layouts/layout.module.scss'

export const Layout: FC<LayoutProps> = props => {
  const { children, home } = props

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta
          name="description"
          content="T.Kengo's blog."
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            SITE_TITLE
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={SITE_TITLE} />
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
