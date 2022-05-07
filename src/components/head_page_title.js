import Head from 'next/head'

export default function HeadPageTitle({ props=null }) {
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE

  return (
      <Head>
        <title>
          {!props ? `${siteTitle}` : `${props} | ${siteTitle}`}
        </title>
      </Head>
  )
}
