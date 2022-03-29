import Date from '../components/date'
import Head from 'next/head'
import Image from 'next/image'
import Layout, { siteTitle, name } from '../components/layout'
import Link from 'next/link'
import aboutStyles from '../styles/pages/about.module.css'
import { getPageData } from '../lib/page'

export async function getStaticProps() {
  // `id` means file name
  // e.g.) file: about.md, id: about
  const pageData = await getPageData('about')
  return {
    props: {
      pageData
    }
  }
}

export default function About({ pageData }) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <article>
        <h1 className={aboutStyles.headingXl}>{pageData.title}</h1>
        <div className={aboutStyles.lightText}>
          <Date dateString={pageData.created_at} />
        </div>

        <div className={aboutStyles.profileImageSection}>
          <Image
            priority
            src="/images/pages/about/prfl.png"
            className={aboutStyles.borderCircle}
            height={144}
            width={144}
            alt={name}
          />

          <section className={aboutStyles.headingMd}>
            <p>Hi. I'm {name}.</p>
          </section>

          <section className={aboutStyles.snsList}>
            <Link href="https://twitter.com/KengoTAKIMOTO">
              <a>twitter</a>
            </Link>
            <Link href="https://github.com/takimotok">
              <a>github</a>
            </Link>
          </section>
        </div>

        <div dangerouslySetInnerHTML={{ __html: pageData.contentHtml }} />
      </article>
    </Layout>
  )
}
