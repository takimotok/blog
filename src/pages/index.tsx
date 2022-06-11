import { ParsedUrlQuery } from 'querystring'

import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import Link from 'next/link'

import type { Post } from '@/types/pages/index'

import { getSortedPostsData } from '@/libs/posts'

import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'

import styles from '@/styles/modules/pages/home.module.scss'

type Props = InferGetStaticPropsType<typeof getStaticProps>
type ContextProps = Post & ParsedUrlQuery

export const getStaticProps = async (context: GetStaticPropsContext<ContextProps>) => {
  const posts: Post[] = await getSortedPostsData()

  return {
    props: {
      posts,
    },
  }
}

export const Home: NextPage<Props> = (props) => {
  const { posts }: { posts: Post[] } = props

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
export default Home
