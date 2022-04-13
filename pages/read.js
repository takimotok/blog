import Date from '../components/date'
import Head from 'next/head'
import Layout, { siteTitle, name } from '../components/layout'
import Link from 'next/link'
import readStyles from '../styles/pages/read.module.scss'
import { getPageData } from '../lib/page'

export async function getStaticProps() {
  // `id` means file name
  // e.g.) file: read.md, id: read
  const pageData = await getPageData('read')
  return {
    props: {
      pageData
    }
  }
}

export default function Read({ pageData }) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <article>
        <h1 className={readStyles.headingXl}>{pageData.title}</h1>
        <div className={readStyles.lightText}>
          <Date dateString={pageData.created_at} />
        </div>

        <div dangerouslySetInnerHTML={{ __html: pageData.contentHtml }} />
      </article>
    </Layout>
  )
}
