type Content = {
  id: string
  title: string
  created_at: string
}

export type Post = Content & {
  tags: string | string[]
  updated_at: string
}

export type Page = Content & {
  contentHtml: string
  tags?: string | string[]
  updated_at?: string
}
