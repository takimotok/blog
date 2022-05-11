import Link from 'next/link'
import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'
import { getSortedPostsData } from '@/lib/posts'
import type { Post } from '@/types/pages/index'
import styles from '@/styles/modules/pages/home.module.scss'

export const getStaticProps = async () => {
  const posts: Post[] = getSortedPostsData()

  return {
    props: { posts }
  }
}

export default function Home(props: Post[]) {
  const { posts } = props

  return (
    <Layout home>
      <HeadPageTitle />

      <section className={styles.home}>
        <h2 className={styles.home__headingLg}>Blog</h2>
        <ul className={styles.home__list}>
          {posts.map(({ id, created_at, title }) => (
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
