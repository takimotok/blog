import Head from 'next/head'
import { SITE_TITLE } from '@/constants/Sites'

export default function HeadPageTitle (props=null) {
  const { title } = props

  return (
      <Head>
        <title>
          {!title ? `${SITE_TITLE}` : `${title} | ${SITE_TITLE}`}
        </title>
      </Head>
  )
}
