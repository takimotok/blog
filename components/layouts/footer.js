import Link from 'next/link'
import styles from '@/styles/modules/components/layouts/footer.module.scss'

export default function Footer() {
  return (
      <footer className={styles.footer}>
        <div className={styles.footer__backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      </footer>
  )
}
