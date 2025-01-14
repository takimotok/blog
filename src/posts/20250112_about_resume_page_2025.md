---
title: 職務経歴書を Astro, TailwindCSS で作った
tags: ['resume', 'Astro', 'TailwindCSS']
created_at: '2025-01-14'
updated_at:
---

職務経歴書を作った. 成果物はこれ.

- [Kengo's Resume](https://takimotok.github.io/)

今回はこの件について簡単に紹介.

## モチベーション

作成のモチベーションは次の通り.

- 案件の切れ目だった
- 案件を探す度に更新するのが手間だったので, 楽に更新できる環境が欲しかった

楽に更新, 差分を確認したい, といえば git 管理ですよね.

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

詳細については [package.json · takimotok/takimotok.github.io · GitHub](https://github.com/takimotok/takimotok.github.io/blob/main/package.json) を見てほしい.

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

local 開発環境を docker compose で用意.  
hosting は GitHub Pages.

### 技術選定基準

技術選定基準はコレ.

- 興味本位
- 実際に試した

基本的には興味本位な技術選定基準.  
でも, hosting 先や使用 package, デザイン周りはいきなり コレだ! と決めたわけじゃない.  
素振りの期間が結構長かった.

元々, GitHub Pages + Jekyll でサクッと作ろうと考えていた.  
でも, 次の理由から Jekyll 採用は諦めた.

- Jekyll 環境構築が想定以上にハマりどころが多かった
- web 検索で得られる情報が軒並み古かった

その時の名残で, 現状の repo. 内に `.nojekyll` というファイルが残っている.

このタイミングで方針転換を決意.  
以前からなにかと話題だった Astro に手を出した.

> Astro の素振りをした.
>
> [2024年 振返り | t11o](https://www.kengotakimoto.com/posts/look_back_2024)

昨年 11 月下旬頃から Astro の tutorial を開始した.

- [Build your first Astro Blog | Docs](https://docs.astro.build/en/tutorial/0-introduction/)

この時点では, 上記 url に従って淡々と手を動かす段階.  
まだ職務経歴書は一切作ってない.

tutorial では hosting 先として Netlify がおすすめされていた.  
そこで, アカウントを作り deploy.  
一先ず tutorial を終えた.

素振りした repo. はこれ.  
ここでも, 動作確認用に docker 環境を用意.

- [takimotok/learn_astro_by_creating_blog: learn Astro and deploy to Netlify.](https://github.com/takimotok/learn_astro_by_creating_blog)

tutorial を終える頃には次の技術要素を使うことを決めていた.

- Astro v4.x (この頃はまだ v4 だった)
- TypeScript v5.x
- TailwindCSS v3.4.x

TS については, 現代で JS を触るならデファクトだなと.

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
でも, 数ページの resume だからオーバースペックだったかも.

Linter, Formatter の選定基準はこれ.

- Biome は tutorial 素振りの時点で, 既に nvim で設定していた
- Biome だけでは `.astro` の html 部分が format されないので, Prettier を導入

技術選定についてはこんな感じ.

## こだわりポイント

こだわりポイントはこのへん.

- 第一言語を英語に
- 言語切替ボタン設置

ちょっとググったところ, 世界の英語話者のうち非ネイティブが 80% とのこと.  
私もそっちへ行きたい.  
ということで, 英語を第一, 日本語を第二へ.

グローバル化, と言われて久しいですし.  
ソースコードはそもそも英語ですし.

日本で案件を探す場合, 必然的に日本語ページが必要になる.  
そこで, 言語切替ボタンを用意した.

言語切替周りは SolidJS でやってるけど, React っぽく `useState` でも良かったかもしれない.  
今回はせっかくなので SolidJS のお作法に従った.

## 苦労した点

苦労した点は山ほどある.  
代表的なものはこのへん.

- nvim の Linter, Formatter 設定
- CSS おさらい
- Astro v4 -> v5 へ切り替え
- Component 設計

簡単に解説.

### nvim の Linter, Formatter 設定

Astro とは無関係なエディタの話題.

nvim の Linter, Formatter 設定, および Dockerfile 作成にかなり時間がかかった.  
というのは, project local の binary (今回は `node_modules` 配下) を参照したかったから.

つまりこういうこと.

- `node_modules` 配下に Biome, Prettier があれば, その binary を参照
- なければ global に inst. されたものを参照

host machine と docker container どちらで `$ yarn install` するかによって, binary の仕上がりが異なるらしい.  
というのは, platform に最適化するように compile される (らしい) から.

この点については, host machine 及び docker container 内の `node_modules` 配下のファイル数の違いからも判る.

昔からこの辺りの理解が浅く, nvim を雰囲気で使っていたので大いにハマった.

結局, 次のように回避した.

- Dockerfile の Multi-stage build で, node.js 関連ファイルを次の stage の image へコピー

これによって, host machine, docker container それぞれで `$ yarn install` しても動作に問題がない環境を作った.

今回はこれで乗り切ったけど, 他の案件を見据えて plugin 設定を見直した方がいいかも.  
たぶん, この問題は Dockerfile じゃなく, editor 側でよしなに捌くべき.

### CSS おさらい

例の如く, 久々に CSS を書いた.  
時間が空くと直ぐに忘れるので, 改めて CSS を一通り復習した.

最後まで慣れなかったのがこれ.

- `flex box` で, 親 (`flex container`) or 子 (`flex item`) どちらに, 何の指定が可能なんだっけ?

TailwindCSS は今回初めて触った.  
気付けば不要な箇所に `flex` 宣言をしてしまうことが多かった.  
このへんは慣れが必要そう.

### Astro v4 -> v5 へ切り替え

Astro を触っている間に v5 が発表された.  
v4 -> v5 の設定に多少苦労した.

基本的には公式 doc. を参照しながらの修正になった.  
下記 Breaking Changes を見ると良い.

- [Upgrade to Astro v5 | Docs](https://docs.astro.build/en/guides/upgrade-to/v5/#breaking-changes)

### Component 設計

Component 設計も苦労した.  
どこまで Component にする? という疑問が尽きないままリリースした.

今回は私しかメンテしないから エイヤッ で決めちゃったけど, チーム開発だと論点の一つになり得る.  
次の人の間で意見が分かれそう.

- 経験の深い人, 勉強している人
- 経験の浅い人

## 諦めた点

リリース優先でいくつかの機能を先送りにした.  
先送りにした機能は GitHub Issue として list up してある.

- [Issues · takimotok/takimotok.github.io · GitHub](https://github.com/takimotok/takimotok.github.io/issues)

ざっと書くとこんな感じ.

- Apple Sillicon で, `md-to-pdf` を有効化するための Dockerfile 作成
- GitHub Pages で preview ページ作成
- Resume を PDF で Download 可能にする button 設置
- Light, Dark mode button
- Slack へ deploy 通知
- CI (github actions)
- responsive layout に磨きをかける

上記の中では1点目が鬼門だと思ってる.  
動作する CPU Architecture を見て, 採用する chromium を切り替える, みたいな処理が必要なはず.

違うやり方, もっと良いやり方を知っている人がいたら教えてほしい.

## 学んだこと

今回の一連の作業で学んだことはたくさんある.  
技術的なことから精神的なこと, 反省点に至るまで多岐にわたる.

代表的なのはこのへん.

- CPU Architecture までケアするのは厄介
- TailwindCSS 触る前に CSS を全体的に復習しておくべき
- システムも大事だけど, 職務経歴書の内容も充実させるべき

3点目を重視するなら, 自前で職務経歴書の環境を用意せず他のサービスを利用した方が早い.

## まとめ

素振りから初めて職務経歴のリリースまで漕ぎ着けた.  
この記事が生まれたのもこの活動のおかげ.

ところで, 先日, 知り合いの採用担当者2人に次の点を質問した.

- 正直ベースで, 採用時にどのくらい職務経歴書見てる?

2人の回答はこれ.

- 正直, 経歴書よりも会って話した雰囲気や内容を重視してるよ

世知辛い.  
でも, 私も採用時はそうしてる.

今回は以上.
