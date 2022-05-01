import fs from 'fs'
import glob from 'glob';
import matter from 'gray-matter'
import path from 'path'
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(fileName => {
    // Remove "prefix (date)" and ".md" from file name to get id
    const id = fileName.replace(/\d{8}_([\w\-]+)\.md$/, '$1')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    }
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

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: '1st-post-fileName'
  //     }
  //   },
  //   {
  //     params: {
  //       id: '2nd-post-fileName'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\d{8}_([\w\-]+)\.md$/, '$1')
      }
    }
  })
}

export async function getPostData(id) {
  // id は fileName から日付を除いたものなので,
  // glob で対象 dir. を検索して fullPath を取得する.
  // e.g.)
  //  id: 1st-post
  //  fileName: 20220406_1st-post
  const pattern = path.join(postsDirectory, `*_${id}.md`)
  const fullPath = path.join(glob.sync(pattern).shift())
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Convert markdown into HTML string
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {footnoteLabel: 'Footnotes'})
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(matterResult.content);
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}
