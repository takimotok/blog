import { ParsedUrlQuery } from 'querystring'

import { GetStaticPropsContext, GetStaticPaths, InferGetStaticPropsType, NextPage } from 'next'

import type { PostData } from '@/types/pages/posts/id'

import { getAllPostIds, getPostData } from '@/libs/posts'

import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'

import styles from '@/styles/modules/pages/post.module.scss'

type Props = InferGetStaticPropsType<typeof getStaticProps>
type ContextProps = PostData & ParsedUrlQuery

export const getStaticProps = async (context: GetStaticPropsContext<ContextProps>) => {
  const { params } = context

  if (!params) {
    return {
      notFound: true,
    }
  }
  const postData: PostData = await getPostData(params.id)

  return {
    props: { postData },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPostIds()

  return {
    paths,
    fallback: false,
  }
}

export const Post: NextPage<Props> = (props) => {
  const {
    title,
    created_at,
    contentHtml,
  }: {
    title: 'string'
    created_at: 'string'
    contentHtml: 'string'
  } = props['postData']

  return (
    <Layout>
      <HeadPageTitle title={title} />

      <article className={`post`}>
        <h1 className={styles.post__headingLg}>{title}</h1>
        <div className={styles.post__date}>
          <Date dateString={created_at} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </Layout>
  )
}
export default Post
