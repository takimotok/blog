import Link from 'next/link'
import styles from '@/styles/modules/components/layouts/header.module.scss'

export default function Header() {
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE

  return (
      <header className={styles.header}>
        <div className={styles.header__siteTitle}>
          <Link href={`/`}>
            <a>{siteTitle}</a>
          </Link>
        </div>
        <nav>
          <ul className={styles.header__navList}>
            <li className={styles.header__navList__item}>
              <Link href={`/about`}>
                <a>About</a>
              </Link>
            </li>
            <li className={styles.header__navList__item}>
              <Link href={`/read`}>
                <a>Read</a>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
  )
}
