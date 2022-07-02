import { ParsedUrlQuery } from 'querystring'

import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Twitter, GitHub } from 'react-feather'

import type { Page } from '@/types/pages/index'

import { getPageData } from '@/libs/page'

import { Date } from '@/components/date'
import { HeadPageTitle } from '@/components/head_page_title'
import { Layout } from '@/components/layout'

import { AUTHOR_NAME } from '@/constants/Authors'

import styles from '@/styles/modules/pages/about.module.scss'

type Props = InferGetStaticPropsType<typeof getStaticProps>
type ContextProps = Page & ParsedUrlQuery

export const getStaticProps = async (context: GetStaticPropsContext<ContextProps>) => {
  // `id` stands for file name
  // e.g.) file: about.md, id: about
  const pageData: Page = await getPageData('about')

  return {
    props: { pageData },
  }
}

export const About: NextPage<Props> = (props) => {
  const { title, created_at, contentHtml } = props['pageData']

  return (
    <Layout>
      <HeadPageTitle title={title} />

      <article className={`about`}>
        <h1 className={styles.about__headingLg}>{title}</h1>
        <div className={styles.about__date}>
          <Date dateString={created_at} />
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
              <a>
                <Twitter className={styles.about__snsList__icon} />
              </a>
            </Link>
            <Link href="https://github.com/takimotok">
              <a>
                <GitHub className={styles.about__snsList__icon} />
              </a>
            </Link>
          </section>
        </div>

        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </Layout>
  )
}
export default About
