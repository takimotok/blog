import { parseISO, format } from 'date-fns'

export const Date = props => {
  const { dateString } = props
  const date: string = parseISO(dateString)

  return <time dateTime={dateString}>{format(date, 'yyyy-MM-dd')}</time>
}
