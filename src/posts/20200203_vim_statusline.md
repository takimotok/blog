---
title: 'vim の statusline をオシャレにしたい. lightline.vim の行,列文字色を変更したい'
tags: ['vim']
created_at: '2020-02-03'
updated_at: ''
---

vim の statusline をオシャレにしたいので lightline を導入する.

## 動作環境

- mac mojave 10.14.5
- tmux 2.9a
- Terminal
- vim 8.0
- vim-plug

tmux session 内で vim 起動.  
plugin 管理は vim-plug で行う.  
iTerm2 ではなく Terminal を使用.

## lightline について

statusline をお洒落にしつつ, 必要な情報を表示してくれる plugin.  
私は作者のブログを見て導入しようと思った.  
最小限の機能って素敵.

- [lightline.vim作りました - プラグインの直交性について](https://itchyny.hatenablog.com/entry/20130824/1377351527)

github はこちら.

- [itchyny/lightline.vim](https://github.com/itchyny/lightline.vim)

この2つを見れば概要が把握できるはず.

## install

.vimrc にこれを書く

```
Plug 'itchyny/lightline.vim'
```

install

```
:PlugInstall
```

ん... 表示されない.

## lightline がうまく機能しないならまずは readme を眺めた方がいい

起きている現象はコレ

- split しないと lightline が表示されない

github の readme に対策が書いてあった.

> add the following configuration to your .vimrc. `set laststatus=2`

.vimrc に書く前に今開いているファイル上で `:set laststatus=2` と打てば動作確認可能.  
やはり一次情報に当たるのは大切.

### laststatus ってなに

折角なので help を眺める.  
常に status line を前面に表示する設定なんだね.

> ```
> The value of this option influences when the last window will have a  
> status line:  
>         0: never  
>         1: only if there are at least two windows  
>         2: always  
> The screen looks nicer with a status line if you have several  
> windows, but it takes another screen line. |status-line|  
> ```
>
> -- `:help laststatus`

## Colorscheme configuration

readme に倣えば color scheme が変更可能.  
help でリストが見れるらしい.

- `:h g:lightline.colorscheme`

default だと powerline らしい.  
たとえば jellybeans を使いたいならこうする.

```
let g:lightline = {
  \ 'colorscheme': 'jellybeans',
  \ }
```

ひとまず default のままにしておく.

## Advanced configuration

readme のこのセクションは component の話.  
設計思想から書かれている.

- [https://github.com/itchyny/lightline.vim#advanced-configuration](https://github.com/itchyny/lightline.vim#advanced-configuration)

コンポーネントの概念については作者のブログに日本語で書かれている.  
先に日本語を読んでおくと readme 理解の助けになる.

- [作者が教える！ lightline.vimの設定方法！ 〜 初級編 - コンポーネントを作ってみよう](https://itchyny.hatenablog.com/entry/20130917/1379369171)

component group は同じ色になる, ã£ていうのは知っておいた方がいいかも.

### vim script をさらっと学んだほうがいい

で, この辺から vim script から逃げられんな... って気持ちになってくるから, 先に vim script をさらっと学ぶ.

- [.vimrc を読むための vim script の基本](https://kengotakimoto.com/post-3169/)

この記事でも書いたけど, help に目を通すのが大切.  
今回ならこんな感じ.

- `:h lightline`
- `:h statusline`

### couponents default value は `:h g:lightline.component` で見れる

component default 設定は `:h g:lightline.component` で見れる.  
軽く眺めておく.

```
" g:lightline.component

let g:lightline.component = {
    \ 'mode': '%{lightline#mode()}',
    \ 'absolutepath': '%F',
    \ 'relativepath': '%f',
    \ 'filename': '%t',
    \ 'modified': '%M',
    \ 'bufnum': '%n',
    \ 'paste': '%{&paste?"PASTE":""}',
    \ 'readonly': '%R',
    \ 'charvalue': '%b',
    \ 'charvaluehex': '%B',
    \ 'fileencoding': '%{&fenc!=#""?&fenc:&enc}',
    \ 'fileformat': '%{&ff}',
    \ 'filetype': '%{&ft!=#""?&ft:"no ft"}',
    \ 'percent': '%3p%%',
    \ 'percentwin': '%P',
    \ 'spell': '%{&spell?&spelllang:""}',
    \ 'lineinfo': '%3l:%-2v',
    \ 'line': '%l',
    \ 'column': '%c',
    \ 'close': '%999X X ',
    \ 'winnr': '%{winnr()}' }
```

## カスタマイズする

inst. 後はこんな見た目.

![vim-lightline_installed](/images/pages/posts/20200203/justInstalled.png)

ここから次の点をカスタマイズ.

- separator, subseparator を `/`, `\` に
- 行数, 列数 の文字色を見やすく

やってみる.

### separator, subseparator を `/`, `\` に

statusline をオシャレにして気分を盛り上げたいので separator, subseparator をそれぞれ `/`, `\` にする.

separator, subseparator っていうのはこれのこと.

- separator: component group 間区切り文字
- subseparator: component group 内の component 間区切り文字

separator, subseparator 各 default 値は help に書いてある

> g:lightline.separator _g:lightline.separator_  
> g:lightline.subseparator _g:lightline.subseparator_ Dictionaries to store separators.  
> The default value is let g:lightline.separator = { 'left': '', 'right': '' }  
> let g:lightline.subseparator = { 'left': '|', 'right': '|' }
>
> -- `:h g:lightline.separator*`

やってみる.  
.vimrc をこうする.

```
" lightline

set laststatus=2
set noshowmode " lightline で mode 表示するので default 表示は不要
let g:lightline = {
  \ 'separator': { 'left': "\ue0bc ", 'right': "\ue0be " },
  \ 'subseparator': { 'left': "\ue0bd ", 'right': "\ue0bf " },
  \ }
```

するとこんな感じで separator, subseparator が文字化けした.

![vim-lightline_failed](/images/pages/posts/20200203/failed.png)

どうやらフォントにパッチを当てる必要があるらしい.  
方法はここを参考にした. 大変お世話になりました.

- [MacVim に lightline.vim をインストールしたお話。](https://yuzuemon.hatenablog.com/entry/2013/12/02/223804)

私は macVim じゃないから若干変える.

私は `Ricty Diminished Regular` を利用している.  
今後 statusline にアイコンも表示したくなるかもしれない...  
と, 思いながら Ricty Diminished にパッチを当てる.

必要なツールはこれ.

- [fontforge](https://fontforge.org/en-US/)

  - フォント作成のためのオープンソースソフト
- [nerd fonts](https://github.com/ryanoasis/nerd-fonts)

  - イケてるアイコンフォント
  - font patcher 同梱

パッチを当ててみる.

まずは Ricty Diminished の在り処を確認.  
なければ isnt. する.

```
$ ls ~/Library/Fonts/RictyDiminished*

/Users/{pc 名}/Library/Fonts/RictyDiminished-Bold.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminished-BoldOblique.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminished-Oblique.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminished-Regular.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminishedDiscord-Bold.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminishedDiscord-BoldOblique.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminishedDiscord-Oblique.ttf
/Users/{pc 名}/Library/Fonts/RictyDiminishedDiscord-Regular.ttf
```

今回 RictyDiminishedDiscord-\*.ttf は対象外とする.

次に fontforge.  
コマンドラインで使用可能に.

```
# inst. fontforge
$ brew install fontforge

# path 確認
$ brew --prefix fontforge
/usr/local/Cellar/fontforge/20190801_1

# `which fontforge` で出てこないから brew link する
$ brew link fontforge

# 確認
$ which fontforge
/usr/local/bin/fontforge

# 簡単な使い方を確認
$ fontforge --help
```

次に nerd fonts.  
使用後に簡åに削除できるように 一時 dir. を作成する.

```
# dir. 作って移動
$ mkdir ~/Desktop/tmp && cd ~/Desktop/tmp

# clone
# 重くて時間がかかるので他の作業をしながら待つ
$ git clone https://github.com/ryanoasis/nerd-fonts.git
```

font を合成する前に nerd-fonts 同梱の font-patcher の使い方を眺める.

必要そうなオプションはこのへん.

> - \-l, --adjust-line-height
>   - Whether to adjust line heights (attempt to center powerline separators more evenly)
> - \-q, --quiet, --shutup
>   - Do not generate verbose output
> - \-w, --windows
>   - Limit the internal font name to 31 characters (for Windows compatibility)
> - \-c, --complete
>   - Add all available Glyphs
> - \-out \[OUTPUTDIR\], --outputdir \[OUTPUTDIR\]
>   - The directory to output the patched font file to
>
> -- [Option 8: Patch Your Own Font](https://github.com/ryanoasis/nerd-fonts#option-8-patch-your-own-font)

windows 用オプションは不要かも.  
私のサブ機が win. だから一応作っとく.

合成.  
font を一つずつ指定するのが手間なので xargs で楽をする.

```
# 実行
$ ls ~/Library/Fonts/RictyDiminished-* | \
    xargs -I% fontforge ./font-patcher % -l -q -w -c --progressbars -out ~/Library/Fonts/

# 全部終わったらこの表示が出る
Generated: Ricty Diminished Regular Nerd Font Complete Windows Compatible

# 確認
$ ls ~/Library/Fonts/
```

`ls` したら判るけどファイルサイズがデカイ.  
不要なものは合成しない方がいいかも.

あとは Terminal Preferences でイマ作成したフォントを指定すれば文字化けが解消される.

![vim-lightline_iceberg](/images/pages/posts/20200203/iceberg.png)

ここで気になった点はこれ.

- separator の色が若干 component group と異なる
- 若干高さ, 横幅がズレる

この辺りは自身の環境にãって差が出てくる.  
それは terminal 自体の scheme だったり, 採用する font, tmux の利用, etc... だったり.  
試しに terminal scheme を Basic, Iceberg で比較した.

| Scheme | Result | note |
| :-- | :-- | :-- |
| Basic | ![vim-lightline_basic](/images/pages/posts/20200203/basic.png) | opacity 100% |
| Iceberg | ![vim-lightline_iceberg](/images/pages/posts/20200203/iceberg.png) | opacity 60% |

まず separator の色について.  
statusline 自体の色の栄え方が全く異なる.  
terminal 設定をいろいろ触ったけど, 私の環境だと opacity が強く影響してるっぽい.

lightline 作者の itchyny さんによると, separtor の色は両側に位置する component によって自動計算されるかコントロールできないとのこと.

> Sorry but it's impossible to change the color of separators.  
> The colors are automatically calculated from the colors of the both sides, in order to provide seamless borders for the patched fonts.  
> It might be possible by overwriting the highlight of LightLineLeft\_normal\_0\_1 but it's not a clean solution.
>
> -- https://github.com/itchyny/lightline.vim/issues/85#issuecomment-61940561

separator, subseparator 色については一旦完了.  
今後気になった時に再調査する.

次に高さ & 横幅のズレについて.  
これは先に調査している方がいた.

> 以下で区切り文字がピッタリ合わないとひたすら文句を言っている部分があるが、  
> powerline用フォントの表示が「微妙に」ずれるのはambiguous widthかどうかは関係なくターミナルとフォントの相性によるようだ。  
> フォントサイズや解像度、フォント合成に使ったpatcher等で容易にずれる。  
> そもそもpowerlineの区切り文字を合わせる際に無理をしているので高さが合わないことがある。
>
> -- [Nerd fontとpowerlineとambiguous width](https://qiita.com/s417-lama/items/b38089a42fe7d4a061da)

私は一旦コレでよしとした.  
諦めきれない場合はこの方が [自分だけのPowerline](https://qiita.com/s417-lama/items/19795d15df3f03149bce) というクールな記事を書いているので参照されたし.

### 行数, 列数 の文字色を見やすく

ここまでの作業で, 私の環境では terminal の opacity が statusline 視認性に影響している所まで分かった.  
視認性向上のためにもう少しだけ頑張る.

現状だと statusline 右端の行数・列数が見にくい.

![vim-lightline_iceberg](/images/pages/posts/20200203/iceberg.png)

opacity を変えずに lightline scheme 設定を変えてみる.

まず help を眺める.

> In general, each palette follows the following style:
>
> ```
> let s:p.{mode}.{where} = [ [ {guifg}, {guibg}, {ctermfg}, {ctermbg} ], ... ]
> ```
>
> -- `:h lightline-colorscheme`

`guifg` が今回の変更対象箇所.

defualt の lightline color scheme は powerline なので該当ファイルを眺める.

- `~/.vim/plugged/lightline.vim/autoload/lightline/colorscheme/powerline.vim`

`let s:.normal.right = ...` という感じで script local な変数でいくつか定義されている.  
今回のターゲットはこれ.

- normal mode の
- 右端の component の
- 文字の色

だから書き換える箇所はここ.

```
" ~/.vim/plugged/lightline.vim/autoload/lightline/colorscheme/powerline.vim

let s:p.normal.right = [ ['gray5', 'gray10'], ['gray9', 'gray4'], ['gray8', 'gray2'] ]
```

↑ これはこう読む ↓

- normal mode の 右端は
- 3つの component group で構成されていて
- 第1要素の `['gray5', 'gray10']` が変更対象箇所だよ

statusllne 右端の component group はこの配列の第1要素.  
第3要素じゃないので注意.  
help で確認した `guifg` はここの `gray5`.

指定可能な色はここで定義されている.

- `~/.vim//plugged/lightline.vim/autoload/lightline/colorscheme.vim`

変更してみる.  
scheme ファイルを直接変更するのは怖いので, default の powerline scheme をコピーして編集する作戦.

```
# copy color scheme from powerline into new one
$ cd ~/.vim/plugged/lightline.vim/autoload/lightline/colorscheme/
$ cp powerline.vim mypowerline.vim

# edit new file
$ vi mypowerline.vim
# 10行目らへん
" let s:p.normal.right = [ ['gray5', 'gray10'], ['gray9', 'gray4'], ['gray8', 'gray2'] ]
let s:p.normal.right = [ ['white', 'gray10'], ['gray9', 'gray4'], ['gray8', 'gray2'] ]
```

.vimrc で mypowerline.vim を color scheme として指定

```
" lightline
set laststatus=2
set noshowmode " lightlint で mode 表示するので default 表示は不要
" 行:列 文字色を white へ変更
let g:lightline = {
  \ 'colorscheme': 'mypowerline',
  \ 'separator': { 'left': "\ue0bc ", 'right': "\ue0be " },
  \ 'subseparator': { 'left': "\ue0bd ", 'right': "\ue0bf " },
  \ }
```

↑ これの変更後はこれ ↓

![vim-lightline_changed row column color](/images/pages/posts/20200203/Screen-Shot-2020-02-01-at-23.04.47.png)

できた.  
statusline 右端の文字が白色になり, 随分視認性が向上した.  
変更前後を比較すると一目瞭然.

| scene | image |
| :-- | :-- |
| before | ![vim-lightline_iceberg](/images/pages/posts/20200203/iceberg.png) |
| after | ![vim-lightline_changed row column color](/images/pages/posts/20200203/Screen-Shot-2020-02-01-at-23.04.47.png) |

で, これだけだと再度何らかのファイルを開いた時に 「mypowerline って colorscheme はないよ」 って怒られる.  
mypowerline の最下部を次のように変更する.

```
" ~/.vim/plugged/lightline.vim/autoload/lightline/colorscheme/mypowerline.vim

" #powerline -> #mypowerline へ変更
let g:lightline#colorscheme#mypowerline#palette = lightline#colorscheme#fill(s:p)
```

本当は .vimrc への追記のみで完結したかったけど, 私にはできなかった.  
もっとスマートな方法があるかもしれない.

## まとめ

一先ず目的達成.

今回の目的を達成するためにこんな事を覚えた.

- vim script の基本
- font 合成方法 & パッチの当て方

困ったら help を読もう.  
lightline の help は懇切丁寧に書かれていて理解しやすい.

ありがたく使わせて頂きます.

今回は以上.
