import fs from 'fs'
import { readdir } from 'node:fs/promises'
import path from 'path'

import glob from 'glob'
import matter from 'gray-matter'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import type { Post } from '@/types/pages/index'
import type { PostData } from '@/types/pages/posts/id'

import { POSTS_DIRECTORY } from '@/constants/Paths'

type MatterResultData = Post | { [key: string]: string }

export const getSortedPostsData = async (): Promise<Post[]> => {
  // Get file names under /posts
  const fileNames: string[] = await readdir(POSTS_DIRECTORY)

  const allPostsData: Post[] = fileNames.map((fileName) => {
    // Remove "prefix (date)" and ".md" from file name to get id
    const id: string = fileName.replace(/\d{8}_([\w-]+)\.md$/, '$1')

    // Read markdown file as string
    const fullPath: string = path.join(POSTS_DIRECTORY, fileName)
    const fileContents: string = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)
    const { title, tags, created_at, updated_at }: MatterResultData = matterResult.data
    const post: Post = {
      id,
      title,
      tags,
      created_at,
      updated_at,
    }

    return post
  })

  // Sort posts by created_at
  return allPostsData.sort(({ created_at: a }, { created_at: b }) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}

export const getAllPostIds = async () => {
  const fileNames: string[] = await readdir(POSTS_DIRECTORY)

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\d{8}_([\w-]+)\.md$/, '$1'),
      },
    }
  })
}

export const getPostData = async (id: string): Promise<PostData> => {
  // id は fileName から日付を除いたものなので,
  // glob で対象 dir. を検索して fullPath を取得する.
  // e.g.)
  //  id: 1st-post
  //  fileName: 20220406_1st-post.md
  const pattern: string = path.join(POSTS_DIRECTORY, `*_${id}.md`)
  const fullPath: string = path.join(glob.sync(pattern)[0])
  const fileContents: string = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Convert markdown into HTML string
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { footnoteLabel: 'Footnotes' })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  const { title, tags, created_at, updated_at }: MatterResultData = matterResult.data

  const postData: PostData = {
    id,
    contentHtml,
    title,
    tags,
    created_at,
    updated_at,
  }

  return postData
}
