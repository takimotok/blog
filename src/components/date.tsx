import { parseISO, format } from 'date-fns'
import { FC } from 'react'

import type { DateProps } from '@/types/components/date'

export const Date: FC<DateProps> = (props) => {
  const { dateString } = props
  const date: Date = parseISO(dateString)

  return <time dateTime={dateString}>{format(date, 'yyyy-MM-dd')}</time>
}
