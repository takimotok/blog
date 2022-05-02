---
title: 'vim で cursorline を hightlight するために help を眺める'
tags: ['vim']
created_at: '2019-01-28'
---

他のエディタでは意識せずともカーソルのある行がハイライトされる.  
もしくは背景色が変わる.  
vim でこれを実現するには設定が必要.

vim 初心者なのでまずはちゃんとヘルプを読めるようになりたい.  
ヘルプを参考に cursor line のハイライトを実現する.

## 動作環境

- macOS Mojave 10.14.x
- vim 8.1

## 結論

次のようなコマンドを vim 内で叩く or `.vimrc` に書き込めば実現可能.

```
:highlight CursorLine cterm=NONE ctermfg=white ctermbg=DarkGray
```

こういう結果だけならググればすぐに見つかる.  
でも, コマンドの意味までは分からない.

コマンドの意味まで知りたいのでヘルプを見て調査する.

## :highlight の使い方をヘルプで調べる

vim でヘルプを確認してみる.  
ヘルプの表示はこのコマンド.

```
:h highlight
```

ヘルプ内で今回見るべき部分は次の箇所.

> :hi\[ghlight\] \[default\] {group-name} {key}={arg} ..
>
> ```
> Add a highlight group, or change the highlighting for
> an existing group.
> See |highlight-args| for the {key}={arg} arguments.
> See |:highlight-default| for the optional [default]
> argument.
> ```

まず構文を読み解く.  
構文を分解するとこんな感じ.

- `:` コマンドモード
- `[]` 省略可
- `[default]` 詳しくは `:highlight-default` を参照
- `{group-name}` highlightするグループ
    - 新規追加 or 既存のものを選択
- `{key}={arg}` キー, 値のペアで色の決定をする (はず)

後半3つについてさらに調べる.

### `[default]`

ヘルプを見てみる.

`:h highlight-default`

ちょっと長いからここには書かないけど, このコマンドで default highlighting groups が表示される.  
一部を抜粋.

> ```
> *highlight-groups* *highlight-default*
> ```
>
> These are the default highlighting groups.  
> These groups are used by the 'highlight' option default.  
> Note that the highlighting depends on the value of 'background'.  
> You can see the current settings with the ":highlight" command.  
>
> 中略
>
> ```
> *hl-CursorLine*
> ```
>
> CursorLine the screen line that the cursor is in when 'cursorline' is set

`background` に依存するから注意してね, とのこと.

どうやら `:highlight` で現状の設定が見れるらしい.  
↑このコマンドで `CursorLine` の行に書いてあるのが現状の設定.  
私の場合はこんな感じ↓

```
CursorLine     xxx term=underline ctermfg=15 ctermbg=0 guibg=Grey90
```

`[default]` については以上.

### `{group-name}`

さっきの `[default]` で見たものが default highlighting groups.  
だから今回対象となる `{group-name}` は `CursorLine`.

`{group-name}` については以上.

### `{key}={arg}`

さっき `:highlight` で確認したような記述をすればいいっぽい.

```
CursorLine     xxx term=underline ctermfg=15 ctermbg=0 guibg=Grey90
```

この例でいうと key, arg は次の通り.

| key | arg |
| --- | --- |
| term | underline |
| ctermfg | 15 |
| ctermbg | 0 |
| guibg | Grey90 |

各 key の意味がわからないな...  
これもヘルプで確認してみる.

> ```
> *highlight-args* *E416* *E417* *E423*
> ```
>
> There are three types of terminals for highlighting:  
> term a normal terminal (vt100, xterm)  
> cterm a color terminal (MS-DOS console, color-xterm, these have the "Co"  
> termcap entry)  
> gui the GUI For each type the highlighting can be given.  
> This makes it possible to use the same syntax file on all terminals, and use the optimal highlighting.

まずは `term` について.

ターミナの種類ごとにこれらの値が設定可能らしい.  
設定可能なターミナルは次の3種類.

- term
- cterm
- gui

私の環境は xterm-256color だから term に該当する.  
mac の terminal なら プロファイルから確認可能.

この例では `underline` が指定されているけど, 指定可能な値も全部ヘルプに書いてある.  
たとえばこんな感じ↓

> _bold_ _underline_ _undercurl_ _inverse_ _italic_ _standout_ _nocombine_ _strikethrough_

`term` については以上.  
次は `ctermfg`, `ctermbg` について.  
ヘルプを見てみる.

> ctermfg={color-nr} _highlight-ctermfg_ _E421_  
> ctermbg={color-nr} _highlight-ctermbg_ The {color-nr} argument is a color number. Its range is zero to (not including) the number given by the termcap entry "Co".  
> The actual color with this number depends on the type of terminal and its settings.  
> Sometimes the color also depends on the settings of "cterm".  
> For example, on some systems "cterm=bold ctermfg=3" gives another color, on others you just get color 3. For an xterm this depends on your resources, and is a bit unpredictable.  
> See your xterm documentation for the defaults.  
> The colors for a color-xterm can be changed from the .Xdefaults file.  
> Unfortunately this means that it's not possible to get the same colors for each user.  
> See |xterm-color| for info about color xterms. The MSDOS...  
>
> 以下略

terminal の種類と設定によって指定可能なカラー番号が変わってくるっぽい.  
設定可能なカラー番号の確認方法は次の通り.

- 設定可能なカラー番号 確認
    - `:runtime syntax/colortest.vim`
- 現状の設定 確認
    - `:so $VIMRUNTIME/syntax/hitest.vim`

ここにはカラー番号って書いてあるけど, 他にも `white` とか `black` とかでも指定可能.

今更だけど, `cterm` の `c` は Color の頭文字.

文字色, 背景色は次の key に 数字を指定する.

- fg は foreground.
    - 文字色
- bg は background.
    - 背景色

ここまで調べればあとは指定するだけ.

## まとめ

今回はひたすらヘルプを追った.

背景色と文字色を選ぶのは結構難しい.  
個人的には, 常に cursor line が常時ハイライトされているのは視覚的に邪魔だと感じる.

そこで, 行番号もハイライトさせるようにしてみた.  
現在私が設定している配色はこちら.

```
" 行の文字色 & 背景色
highlight CursorLine cterm=NONE ctermfg=white ctermbg=black

" 行番号
highlight CursorLineNr term=bold cterm=NONE ctermfg=yellow ctermbg=NONE
```

今回の作業でヘルプを読むことが苦ではなくなった.  
今回は以上.
