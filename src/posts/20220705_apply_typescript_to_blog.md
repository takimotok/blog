---
title: 'Applied TypeScript to Blog'
tags: ['next.js', 'TypeScript']
created_at: '2022-07-21'
updated_at: ''
---

## sumarry

In this article, I've explained how I applied types to `getStaticProps()` in this blog which is made of Next.js.

The github commit is here.

- https://github.com/takimotok/blog/pull/80

The results are as follow:

```ts
// src/pages/posts/[id].tsx

import { ParsedUrlQuery } from 'querystring'
import { GetStaticPropsContext, GetStaticPaths, InferGetStaticPropsType, NextPage } from 'next'

import type { PostData } from '@/types/pages/posts/id'

type ContextProps = PostData & ParsedUrlQuery

export const getStaticProps = async (context: GetStaticPropsContext<ContextProps>) => {
  const { params } = context

  if (!params) {
    return {
      notFound: true,
    }
  }
  const postData: PostData = await getPostData(params.id)

  return {
    props: { postData },
  }
}
```

## Prerequities

- Next.js 12.1.6
- yarn 1.22.15
- vim 8.2
- sass 1.52.1
- prettier 2.6.2
- eslint 1.3.0

As shown above, I use Vim as an editor and adopt some linting tools like `prettier` and `eslint`.  
I've struggled to set up these tools, as you know, because:

This blog is running as strict mode.

```ts
// tsconfig.json

{
  "compilerOptions": {
    ...
    "strict": true,
    ...
  },
  ...
}
```

- Next.js supports eslint officially from ver. xx and so almost articles, especially in be written by Japanese language, which explains about setting it up are already out of date.
  - So I digged the imprementations like:
    - @TODO: eslint implementations
    - @TODO: paste next.js doc. link about supporting ESLint.
- In my developped periode, Prettier did not support css level 4 and I had to modify its rules

These struggles are too a lot to describe here.  
But you can see my `.vimrc` and `package.json` in here respectively:

- @TODO: .vimrc への link
- @TODO: package.json への link

Thanks to these settings, my development experiences are improved.  
Here's the example GIF when I run `$ git commit`.  
You can see some linting tools are automatically executed.

```sh
# @TODO: git commit 時の console の様子を貼る
```

@TODO: ここに `$ git commit` 時の gif を貼る



### Directory Structures

Here's the blog directries:

```sh
./src
├── components
├── constants
├── libs
├── pages
├── posts
├── styles
└── types
```

TypeScript's codes are in `types` directly.

There are some dotfiles like `next.config.js`, `package.json` and so on.

## Introduction

I applied TypeScript to this blog to get use to it.  
Before my blog was created by WordPress but now it is created with Next.js and Vercel.

I had never experienced to use TypeScript so I thought it was good opportunity to get started it.

While using it, there were many difficulties something like:

- setting up linting tools to this prj. and editor (vim)
- encountering errors
  - nortified by ESLint
  - nortified by StyleLint
  - nortified by Vercel when I pushed my code to

Although I had encountered those, I'll explain especially in how I applied TypeScript to `getStaticProps()`.  
It took a really long time to solve and finally I deployed it successfully.  
That's why I select the topic in this article.

All of my codes are published on GitHub so you can see those anytime.

- [takimotok/blog](https://github.com/takimotok/blog)

## Before/After

Firstly, I'll show you before/after `pages/posts/[id].js`.

Before:

```js
// pages/posts/[id].js

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}
```

After:

```ts
// pages/posts/[id].js

import { ParsedUrlQuery } from 'querystring'
import { GetStaticPropsContext, GetStaticPaths, InferGetStaticPropsType, NextPage } from 'next'

import type { PostData } from '@/types/pages/posts/id'

type ContextProps = PostData & ParsedUrlQuery

export const getStaticProps = async (context: GetStaticPropsContext<ContextProps>) => {
  const { params } = context

  if (!params) {
    return {
      notFound: true,
    }
  }
  const postData: PostData = await getPostData(params.id)

  return {
    props: { postData },
  }
}
```

In before source codes, the `getStaticProps` methods simply recieve `params` as an argument.  
And then, return `postData` as `props` which is retrieved by `getPostData(params.id)` inside the method.  
As you can see, there are no types and guards.

In after source codes, on the other hands, the `getStaticProps` is defined as a typed method.  
`context` argument is typed as `GetStaticPropsContext` which is imported from `next`.


## How I applied TypeScript to getStaticProps()

Here are the steps which I took to solve errs.:

- First of all, I read [Next.js official document especially in ESLint page](https://nextjs.org/docs/basic-features/eslint) for linting codes
- Next, I explored Next.js implementations under the `node_modules` directory
- Next, change the target file with reference to the above implementations
- Finally, execute linters and build codes (e.g. `$ yarn dev`), and then check if it works fine or not

Here's a bit details about those.

### First of all, I read Next.js official document especially in ESLint page for linting codes

According to official doc, Next.js officially supports ESLint.

> Since version 11.0.0, Next.js provides an integrated ESLint experience out of the box.  
> Add next lint as a script to package.json:
>
> ```
> "scripts": {
>   "lint": "next lint"
> }
> ```
> -- [ESLint | nextjs.org](https://nextjs.org/docs/basic-features/eslint)

And also, `eslint-config-next` is its default configuration.

> The default configuration (`eslint-config-next`) includes everything you need to have an optimal out-of-the-box linting experience in Next.js.
>
> -- [ESLint Config](https://nextjs.org/docs/basic-features/eslint#eslint-config)

Its implementations are written in this file:

- `node_modules/eslint-config-next/index.js`

We have to select the rules which we need and specify those into its configuration file.  
In my case, I excluded `plugin:@typescript-eslint/recommended-requiring-type-checking` rule to avoid a specific err. and wrote it to `.eslintrc.json`.  
The err. was something like as follow:

```
Oops! Something went wrong! :(

ESLint: 8.16.0

Error: Error while loading rule '@typescript-eslint/await-thenable': You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.
Occurred while linting /Users/takimoto/Desktop/prj/blog/next.config.js
    at Object.getParserServices (/Users/takimoto/Desktop/prj/blog/node_modules/@typescript-eslint/utils/dist/eslint-utils/getParserServices.js:16:15)
```

My `.eslintrc.json` is in GitHub so you can check it anytime.

- [takimotok/blog/.eslintrc.json | github.com](https://github.com/takimotok/blog/blob/main/.eslintrc.json)


### Next, I explored Next.js implementations under the `node_modules` directory

I wanted to know where was the type implementations about `getStaticProps()`.  
So I decided 

 - And found a file: `node_modules/next/types/index.d.ts`


### Change the target file with reference to the above implementations


### Finally, execute linters and build codes (e.g. `$ yarn dev`), and then check if it works fine or not


The type of definition `GetStaticPropsContext` is under the `node_modules` directory as follow:

```ts
// node_modules/next/types/index.d.ts

export type GetStaticPropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = {
  params?: Q
  preview?: boolean
  previewData?: D
  locale?: string
  locales?: string[]
  defaultLocale?: string
}
```

`GetStaticPropsContext` uses `Q` and `D` as arguments which extend `ParsedUrlQuery` and `PreviewData` respectively.  
According to above, these arguments have default value so it can be used without any type arguments.
That's why I implemented those as `import` at the beggining of `pages/posts/[id].js`.

`ContextProps` is passed to `GetStaticPropsContext` as `Q` which is defined as intersection type as follow:

```ts
// pages/posts/[id].js

type ContextProps = PostData & ParsedUrlQuery
```

The type of `PostData` is defined as follow:

```ts
export type PostData = {
  id: string
  title: string
  created_at: string
  tags: string | string[]
  updated_at: string
  contentHtml: string
}
```

Guard clause `if (!params) {}` is written to avoid the err. like:

```
[tsserver] Object is possibly 'undefined'. [Error]
```

Both before and after codes are here:

- [before](https://github.com/takimotok/blog/pull/80/files#diff-c2c4666dc7dee3ae3776fbeba77d529d318f9ea09748e917e2b5a6a258a3ee79L7)
- [after](https://github.com/takimotok/blog/pull/80/files#diff-e2d6896c3bf00eadee7ab87f3c2251c3d50625184223663a3791261f2cafb82fR18)

## Conclusion

I've shown how I applied types to `getStaticProps()` to this blog made by Next.js.

What I learned from the lessons are:

- should take a look official documents
- should take a look its implementations (in this case, Next.js implementations under the `node_modules` directory)
- should adopt linters and TypeScript from the beggining if I'm going to do that in the future

If you have any feedbacks, please contact me from twitter @KengoTAKIMOTO or GitHub.

That's all. Thank you.

@TODO: @TODO の箇所対応
