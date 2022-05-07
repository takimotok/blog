import Date from '@/components/date'
import HeadPageTitle from '@/components/head_page_title'
import Image from 'next/image'
import Layout from '@/components/layout'
import Link from 'next/link'
import styles from '@/styles/modules/pages/about.module.scss'
import { AUTHOR_NAME } from '@/constants/Authors'
import { Twitter, GitHub } from 'react-feather';
import { getPageData } from '@/lib/page'

export async function getStaticProps() {
  // `id` stands for file name
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
      <HeadPageTitle title={pageData.title} />

      <article className={`about`}>
        <h1 className={styles.about__headingLg}>{pageData.title}</h1>
        <div className={styles.about__date}>
          <Date dateString={pageData.created_at} />
        </div>

        <div className={styles.about__profile}>
          <Image
            priority
            src="/images/pages/about/prfl.png"
            className={styles.about__profile__image}
            height={144}
            width={144}
            alt={AUTHOR_NAME}
          />

          <section className={styles.about__name}>
            <p>Hi. I'm {AUTHOR_NAME}.</p>
          </section>

          <section className={styles.about__snsList}>
            <Link href="https://twitter.com/KengoTAKIMOTO">
              <a><Twitter className={styles.about__snsList__icon} /></a>
            </Link>
            <Link href="https://github.com/takimotok">
              <a><GitHub className={styles.about__snsList__icon} /></a>
            </Link>
          </section>
        </div>

        <div dangerouslySetInnerHTML={{ __html: pageData.contentHtml }} />
      </article>
    </Layout>
  )
}
