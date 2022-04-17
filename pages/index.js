import Date from '@/components/date'
import HeadPageTitle from '@/components/head_page_title'
import Layout from '@/components/layout'
import Link from 'next/link'
import styles from '@/styles/modules/components/layouts/main.module.scss'
import { getSortedPostsData } from '@/lib/posts'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

export default function Home({ allPostsData }) {
  const siteTitle = process.env.SITE_TITLE

  return (
    <Layout home>
      <HeadPageTitle />

      <section className={styles.main}>
        <h2 className={styles.main__headingLg}>Blog</h2>
        <ul className={styles.main__list}>
          {allPostsData.map(({ id, created_at, title }) => (
            <li className={styles.main__list__item} key={id}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <small className={styles.main__list__item__date}>
                <Date dateString={created_at} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
