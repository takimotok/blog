import Link from 'next/link'
import { FC } from 'react'
import { SITE_TITLE } from '@/constants/Sites'
import styles from '@/styles/modules/components/layouts/header.module.scss'

export const Header: FC = () => {
  return (
      <header className={styles.header}>
        <div className={styles.header__siteTitle}>
          <Link href={`/`}>
            <a>{SITE_TITLE}</a>
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
