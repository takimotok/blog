import Head from 'next/head'
import Link from 'next/link'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'

export const name = 'Kengo'
export const siteTitle = 't11o'

export default function Layout({ children, home}) {
  return (
    <div className={styles.container}>
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
      <header className={styles.header}>
        <div className={styles.siteTitle}>
          <Link href={`/`}>
            <a>{siteTitle}</a>
          </Link>
        </div>
        <nav>
          <ul className={styles.navList}>
            <li className={styles.navListItem}>
              <Link href={`/about`}>
                <a>About</a>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href={`/read`}>
                <a>Read</a>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )}
    </div>
  )
}
