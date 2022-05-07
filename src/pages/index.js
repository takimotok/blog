import Date from '@/components/date'
import HeadPageTitle from '@/components/head_page_title'
import Layout from '@/components/layout'
import Link from 'next/link'
import styles from '@/styles/modules/pages/home.module.scss'
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
  return (
    <Layout home>
      <HeadPageTitle />

      <section className={styles.home}>
        <h2 className={styles.home__headingLg}>Blog</h2>
        <ul className={styles.home__list}>
          {allPostsData.map(({ id, created_at, title }) => (
            <li className={styles.home__list__item} key={id}>
              <small className={styles.home__list__item__date}>
                <Date dateString={created_at} />
              </small>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
