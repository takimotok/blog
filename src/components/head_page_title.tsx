import Head from 'next/head'
import { FC } from 'react'

import type { HeadPageTitleProps } from '@/types/components/head_page_title'

import { SITE_TITLE } from '@/constants/Sites'

export const HeadPageTitle: FC<HeadPageTitleProps> = (props) => {
  const { title } = props

  return (
    <Head>
      <title>{!title ? `${SITE_TITLE}` : `${title} | ${SITE_TITLE}`}</title>
    </Head>
  )
}
