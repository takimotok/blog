---
title: About Resume Page 2025
tags: ['resume']
created_at: '2025-01-14'
updated_at:
---

職務経歴書を作った.

- [Kengo's Resume](https://takimotok.github.io/)

今回は職務経歴書を作成した件について簡単に紹介.

## モチベーション

作成のモチベーションは次の通り.

- 案件の切れ目だった
- 案件を探す度に更新するのが手間だったので, 楽に更新できる環境が欲しかった

我々エンジニアにとって楽に更新できる環境って git ですよね.

モチベーションはそんな感じ.

## 完成形

完成形はこれ.

- [Kengo's Resume](https://takimotok.github.io/)

repo. はここ.

- [takimotok/takimotok.github.io: Kengo's Resume](https://github.com/takimotok/takimotok.github.io)

Docker を起動すれば local で確認できる.  
興味がある方はぜひ.

この blog 右上にも `Resume` link を貼っておいた.

## 技術要素

ここでは使用技術と, 技術選定基準について紹介.

### 使用技術

詳細については <a href="https://github.com/takimotok/takimotok.github.io/blob/main/package.json" target="_blank">package.json | takimotok/takimotok.github.io</a>  を見てほしい.

- Astro v5.x
- TailwindCSS v3.4.x
- SolidJS v1.9.x
- TypeScript v5.x
- md-to-pdf
- yarn v4.x
- Biome v1.9.x
- Prettier v3.4
- GitHub Pages
- Docker

local 開発環境を docker compose で用意して, GitHub Pages に hosting, って感じ.

### 技術選定基準

技術選定基準はコレ.

- 興味本位
- 実際に試した

基本的には興味本位な技術選定基準.  
でも, hosting 先や使用 package についてはいきなり コレだ! と決めたわけじゃない.  
素振りの期間が結構長かった.

元々, GitHub Pages + Jekyll でサクッと作ろうと考えていた.  
でも, Jekyll の環境構築が想定以上にハマりどころが多かったのと, web 検索で得られる情報が軒並み古かったので諦めた.

その時の名残で, 現状の repo. 内に `.nojekyll` というファイルが残っている.

このタイミングで方針転換を決意.  
以前からなにかと話題だった Astro に手を出した.

> Astro の素振りをした.
>
> [2024年 振返り | t11o](https://www.kengotakimoto.com/posts/look_back_2024)

昨年 11 月下旬頃から Astro の tutorial を開始した.

- <a href="https://astro.build/" target="_blank">Astro | astro.build</a>

この時点では, 上記 url に従って淡々と手を動かしていた.  
tutorial では hosting 先として Netlify がおすすめされていたから, アカウントを作って deploy.  
一先ず tutorial を終えた.

素振りした repo. はこれ.  
ここでも, 手元で動作確認したかったので docker 環境を用意.

- [takimotok/learn_astro_by_creating_blog: learn Astro and deploy to Netlify.](https://github.com/takimotok/learn_astro_by_creating_blog)

tutorial を終える頃には, 次の技術要素を使うことを決めていた.

- Astro v4.x (この頃はまだ v4 だった)
- TypeScript v5.x
- TailwindCSS v3.4.x

現代で JS を触るなら TS はデファクトだなと.

TailwindCSS は, 以前からずっと使ってみたかった.

> CSS どうしよう
>
> CSS に関してはいまも少し悩んでる.  
> 現時点ではリリースを優先して生の CSS で style 記述した.  
> 今後どうしよう ?  
>
> 候補はこれ.
>
> - Tailwind CSS
> - Sass (SCSS)
>
> Tailwind CSS は流行っているようなのでつまみ食いしたい.  
> Sass (SCSS) は CSS 力向上と, まだまだ現場で使われている所が多そうなので実益を兼ねて採用したい.

これまでの現場で TailwindCSS を触る機会に恵まれなかったので, このタイミングで導入を決意.

SolidJS は, 参考にした repo. で採用していたのでそのまま真似した.  
でも, 数ページの resume だからオーバースペック (というか不要) だったかも.

Linter, Formatter の選定基準はこれ.

- Biome は tutorial 素振りの時点で, 既に nvim で設定していた
- Biome だけでは `.astro` の html 部分が format されないので, Prettier を導入

技術選定についてはこんな感じ.

## こだわりポイント

ページが少ないけど, いくつかこだわりポイントがる.  
このへん.

- 第一言語を英語に
- 言語切替ボタン設置

ちょっとググったところ, 世界の英語話者のうち, 非ネイティブが 80% とのこと.  
私もそっちへ行きたい.  
ということで, 英語を第一, 日本語を第二へ.

グローバル化, と言われて久しいですし.  
ソースコードはそもそも英語ですし.

だがしかし, 日本で案件を探す場合, 必然的に日本語ページが必要になる.  
そこで, 言語切替ボタンを用意した.

言語切替周りは SolidJS でやってるけど, React っぽく `useState` でも良かったかもしれない.  
今回はせっかくなので SolidJS のお作法に従った.

## 苦労した点

苦労した点は山ほどある.  
そのうちのいくつかはこのへん.

- nvim の Linter, Formatter 設定
- CSS おさらい
- Astro v4 -> v5 へ切り替え
- Component 設計

簡単に解説.

### nvim の Linter, Formatter 設定

いきなり Astro とは無関係な話題.

nvim の Linter, Formatter 設定, および Dockerfile 作成にかなり時間がかかった.  
というのは, project local の binary (今回は `node_modules` 配下) を参照したかったからである.

つまりこういうこと.

- `node_modules` 配下に Biome, Prettier があれば, その binary を参照
- なければ global に inst. されたものを参照

私は js 周りの lint, format を次の plugin に任せている.

- `stevearc/conform.nvim`
- `mfussenegger/nvim-lint`

host machine の設定への依存を避けるためには, project local の binary を第一の参照先にするのが良さそう.

host machine と docker container どちらで `$ yarn install` するかによって, binary の仕上がりが異なるらしい.  
というのは, platform に最適化するように compile される (らしい) から.

昔からこの辺りの理解が浅く,nvim を雰囲気で使っていたので大いにハマった.

結局, 次のように回避した.

- Dockerfile の Multi-stage build で, node.js 関連ファイルを次の stage の image へコピー

これによって, host machine, docker container それぞれで `$ yarn install` しても動作に問題がない環境を作った.

今回はこれで乗り切ったけど, まだ plugin 設定が甘いから設定見直さなきゃなぁ...

### CSS おさらい

例の如く, 久々に CSS を書いた.  
時間が空くと直ぐに忘れるので, 改めて CSS を一通り復習した.

最後まで慣れなかったのがこれ.

- flex box で, 親 (flex container) or 子 (flex item) どちらに, 何の指定が可能なんだっけ?

TailwindCSS では, うっかりすると不要な箇所に `flex` 宣言をしそうになったのが印象的.

### Astro v4 -> v5 へ切り替え

Astro を触っている間に v5 が発表された.  
v4 -> v5 の設定に多少苦労した.

基本的には公式 doc. を参照しながらの修正になった.

### Component 設計

## 諦めた点

## 学んだこと

## まとめ
