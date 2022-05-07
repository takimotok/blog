import Date from '@/components/date'
import HeadPageTitle from '@/components/head_page_title'
import Layout from '@/components/layout'
import styles from '@/styles/modules/pages/post.module.scss'
import { getAllPostIds, getPostData } from '@/lib/posts'

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export default function Post({ postData }) {
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
