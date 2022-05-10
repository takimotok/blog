import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { PAGES_DIRECTORY } from '@/constants/Paths';
import { unified } from 'unified';


// `id` argument means file name
// e.g.) file: about.md, id: about
// note: Extensions must be .md
export async function getPageData(id) {
  const fullPath = path.join(PAGES_DIRECTORY, `${id}.md`)
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
