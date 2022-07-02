import type { Post } from '@/types/pages/index'

export type PostData = Post & {
  contentHtml: string
}
