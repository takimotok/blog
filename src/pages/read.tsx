import { ParsedUrlQuery } from 'querystring'

import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'

import type { Page } from '@/types/pages/index'

import { getPageData } from '@/libs/page'

import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'

import styles from '@/styles/modules/pages/read.module.scss'

type Props = InferGetStaticPropsType<typeof getStaticProps>
type ContextProps = Page & ParsedUrlQuery

export const getStaticProps = async (context: GetStaticPropsContext<ContextProps>) => {
  // `id` stands for file name
  // e.g.) file: read.md, id: read
  const pageData: Page = await getPageData('read')

  return {
    props: { pageData },
  }
}

export const Read: NextPage<Props> = (props) => {
  const { title, created_at, contentHtml } = props['pageData']

  return (
    <Layout>
      <HeadPageTitle title={title} />

      <article className={`read`}>
        <h1 className={styles.read__headingLg}>{title}</h1>
        <div className={styles.read__date}>
          <Date dateString={created_at} />
        </div>

        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </Layout>
  )
}
export default Read
