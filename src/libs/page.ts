import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import type { Post, Page } from '@/types/pages/index'

import { PAGES_DIRECTORY } from '@/constants/Paths'

type MatterResultData = Post | { [key: string]: string }

export const getPageData = async (id: string): Promise<Page> => {
  const fullPath: string = path.join(PAGES_DIRECTORY, `${id}.md`)
  const fileContents: string = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)
  const {
    content,
    data,
  }: {
    content: string
    data: MatterResultData
  } = matterResult
  const { title, tags, created_at, updated_at } = data

  // Convert markdown into HTML string
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { footnoteLabel: 'Footnotes' })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content)
  const contentHtml = processedContent.toString()

  return {
    id,
    contentHtml,
    title,
    tags,
    created_at,
    updated_at,
  }
}
