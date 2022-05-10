import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'
import { getAllPostIds, getPostData } from '@/lib/posts'
import styles from '@/styles/modules/pages/post.module.scss'

export const getStaticProps = async props => {
  const { params } = props
  const postData = await getPostData(params.id)

  return {
    props: { postData }
  }
}

export const getStaticPaths = async () => {
  const paths = getAllPostIds()

  return {
    paths,
    fallback: false
  }
}

export default function Post(props) {
  const { postData } = props

  return (
    <Layout>
      <HeadPageTitle title={postData.title} />

      <article className={`post`}>
        <h1 className={styles.post__headingLg}>{postData.title}</h1>
        <div className={styles.post__date}>
          <Date dateString={postData.created_at} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  )
}
