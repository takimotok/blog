---
title: 'vim で markdown 環境を整える'
tags: ['vim', 'markdown']
created_at: '2019-01-27'
updated_at: ''
---

vim で markdown を書きたい.  
そのための環境構築を行う.

## 動作環境

- macOS Mojave 10.14.x
- vim 8.1

### 前提条件

- vim で plugin manager として pathogen を利用する
- plugin 選定基準
  - 外部依存の少ないもの

vim plugin を探すと星の数ほどヒットする.  
可能な限り npm 等の外部依存がないものをチョイス.

## markdown 環境で実現したい動作 と 実現してくれる plugin

vim で markdown を書く時に実現したい動作と, それを可能にしてくれる plugin を調査する.

### 実現したい動作

実現したい動作は次の通り.

- syntax highlighting
- url リンクをクリックしてページへジャンプ
- list indent
- リアルタイムプレビュー
- TOC (Table of Contents) 有効化
- table フォーマット
- アウトライン表示

### 実現してくれる plugin

先程洗い出した動作を実現してくれそうな plugin は次の通り.

- [plasticboy/vim-markdown | github.com](https://github.com/plasticboy/vim-markdown)
  - syntax highlighting
  - TOC (Table of Contents) 有効化
  - table フォーマット
  - list indent
  - アウトライン表示
- [previm/previm | github.com](https://github.com/previm/previm)
  - リアルタイムプレビュー

各 plugin の特徴はリンク先を参照.

私は pathogen を利用してこれらの plugin を install した.

```
$ cd ~/.vim/bundle

# previm
$ git clone https://github.com/previm/previm.git

# vim-markdown
$ git clone https://github.com/plasticboy/vim-markdown.git
```

pathogen 自体の inst. 方法は過去に書いた ↓こちら の記事を参照.

- [Vim で EditorConfig を使う](https://kengotakimoto.com/post-2960/#plugin_manager_pathogen_install)

## 使ってみる

次の機能を試す.

- [plasticboy/vim-markdown | github.com](https://github.com/plasticboy/vim-markdown)
  - syntax highlighting
  - TOC (Table of Contents) 有効化
  - table フォーマット
  - list indent
  - アウトライン表示
- [previm/previm | github.com](https://github.com/previm/previm)
  - リアルタイムプレビュー

### filetype 確認

念の為, 現在開いているファイルの型を確認しておく.  
markdown のファイルを vim で開いて次のコマンドを実行.

```
:set filetype?
```

`filetype=markdown` と出力されれば ok.

### syntax highlighting

暫く syntax highlighting が効かなくてハマった.  
事前に次の一文を .vimrc に書いておく必要がある.

```
filetype plugin indent on
```

これで言語毎に syntax highlighting してくれるはず.  
たとえばコードブロックに php を指定すれば次のような php の関数もしっかりハイライトしてくれる.

```
<?php

function get() {
    $hoge = 3;
    return $hoge;
}
```

デフォルトでは bash のコードブロックでは `sh` を指定するようになっている.

> Default is \['c++=cpp', 'viml=vim', 'bash=sh', 'ini=dosini'\].

私は fenced code block 内の言語が bash のときは `bash` にしたい.  
default だと `sh` にしないといけないらしい.  
readme によると `.vimrc` に次の一文を追加することで変更可能らしいけど私の環境では変更できなかった.

```
let g:vim_markdown_fenced_languages = ['bash=bash']
```

### TOC

Table of Content を format してくれる機能がある.  
デモはこちらのサイトがわかりやすい.

- [Aligning text with Tabular.vim](http://vimcasts.org/episodes/aligning-text-with-tabular-vim/)

TOC フォーマット機能を利用するには少し準備が必要.  
準備は次の2点.

- `.vimrc` に次の一文を追記
  - `filetype plugin on`
- [godlygeek/tabular](https://github.com/godlygeek/tabular) を plugin として追加

`:Toc` コマンドで, ヘッダのアウトライン表示が可能.  
しかもヘッダを選択して `enter` するとジャンプまでしてくれる. 便利.

Table をよしなに整形するにはカーソルをテーブル内のどこかに置いて `:TableFormat` コマンドを叩けばいい.

```md
| a    | b  | c      |
|------|----|--------|
| this | is | sample |
| 19   | 18 | 17     |
| 123  | re | 5      |
| a    | g  | f      |
```

table format を `|` を入力する度に行いたければ次のリンク先の文言を `.vimrc` に書けばいい.  
私は直近では不要なので書かなかった.

- [tpope/cucumbertables.vim](https://gist.github.com/tpope/287147)

### リアルタイムプレビュー

[previm/previm | github.com](https://github.com/previm/previm) を plugin manager で入れる.  
私は pathogen を使った.

readme にも書いてあるが, filetype を markdown として正しく認識させるために .vimrc に次の記述が必要.

```
let g:previm_open_cmd = 'open -a Google\ Chrome'
augroup PrevimSettings
    autocmd!
    autocmd BufNewFile,BufRead *.{md,mdwn,mkd,mkdn,mark*} set filetype=markdown
augroup END
```

設定を簡単に解説.

- `let` : 値の代入に使う. 今回は変数のスコープの範囲を global に設定するために利用.
- `g:変数` : 指定した変数のスコープを global にする
  - 今回は Google Chrome を指定
- `autocmd`
  - vim で 指定したイベントが発生する度に自動実行するコマンドを指定
  - `.vimrc` を load する度にこの定義が走る
    - 同じ定義が何度も走ると, その分無駄な読み込み時間が必要になる
    - ↑これを防ぐために, グルーピングしたコマンド定義先頭で `autocmd!` をする必要がある
  - `autocmd!` で定義の削除
- `augroup`
  - `autocmd` をグループ化
  - この中で `autocmd!` をすると, グルーピングした定義を全削除してくれる
  - 今回は `PrevimSettings` というグループ名

ここまでできたら, `.md` ファイルを vim で開いて次のコマンドを実行.

- `:PrevimOpen`

これで Chrome に md がレンダリングされる.

## その他: vim-markdown 便利コマンド

vim-markdown plugin の readme を読んでいて便利だと感じた機能やコマンドを紹介.

- `gx`
  - カーソルがある箇所の url リンクをブラウザで開く
  - vim にもとから用意されている `gx` コマンドと違って, `[Example](http://example.com)` のどこにカーソルが在ってもブラウザで開ける
- `]]`, `[[`
  - 次, 前のヘッダへジャンプ
  - `##`, `###` の間を飛びたいときに
    - ヘッダサイズ(`h2` とか `h3` とか) を問わず行き来可能
- `[]`, `][`
  - 同レベルのヘッダ間ジャンプ
    - e.g.) `h2` から `h2` へ. `h3` から `h3` へ
  - 1つ目のカッコで方向を, 2つ目のカッコでジャンプ

今回は以上.
