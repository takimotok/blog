import Link from 'next/link'
import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'
import { getPageData } from '@/lib/page'
import type { ReadProps, PageDataProps } from '@/types/pages/read'
import styles from '@/styles/modules/pages/read.module.scss'

export const getStaticProps = async () => {
  // `id` stands for file name
  // e.g.) file: read.md, id: read
  const pageData: PageDataProps = await getPageData('read')

  return {
    props: { pageData }
  }
}

export default function Read(props: ReadProps) {
  const { pageData } = props

  return (
    <Layout>
      <HeadPageTitle title={pageData.title} />

      <article className={`read`}>
        <h1 className={styles.read__headingLg}>{pageData.title}</h1>
        <div className={styles.read__date}>
          <Date dateString={pageData.created_at} />
        </div>

        <div dangerouslySetInnerHTML={{ __html: pageData.contentHtml }} />
      </article>
    </Layout>
  )
}
