---
title: 'Gitlab commitメッセージに issue ID を自動で紐付ける'
tags: ['git', 'gitlab']
created_at: '2018-02-14'
---

Gitlabにissueを作って, ブランチを切って作業.  
こんな流れて個人的な開発を行っているが, どのコミットがどのissueに紐付いているのか分からなくなる.

`$ git commit -m "ほげほげ #ID"` で issue ID と紐づくらしい.  
毎回 `#ID` を入れるのは面倒なので, 自動で入れられるようにする.

※ 2018.02.17 追記 commit メッセージをGitlab上で1行で表示するために改修

## 前提条件

前提条件は次の点.

- branchの命名ルールを決めておく
- シェルスクリプトがある程度分かる
- 私は `$ git commit -m "コメント"` で commit することが多い

以下, 解説.

### branchの命名ルールを決めておく

私はbranch名を `feature/issue-番号` という感じで運用している.

```
$ git branch

* feature/issue-4
  master
```

このブランチ名末尾の数字を取得して git commit に埋め込む作戦.  
その際, git hook を利用する.

### シェルスクリプトがある程度分かる

今回の作業の大部分はシェルスクリプトで行う.

シェルスクリプトの記述内容は, branch名からissue番号を抽出すること.

`$ git commit` をフックに用意したスクリプトをキックするんだけど,  
そもそもシェルスクリプトをある程度知らないと出来ないので注意.

### 私は `$ git commit -m "コメント"` で commit することが多い

`-m` オプションを付けてコミットすることが多い.  
なので, それを前提にスクリプトを作成する.

## git hook ってなに ?

> 他のバージョンコントロールシステムと同じように、Gitにも特定のアクションが発生した時にスクリプトを叩く方法があります。
>
> -- [Git のカスタマイズ - Git フック | git-scm.com](https://git-scm.com/book/ja/v1/Git-%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA-Git-%E3%83%95%E3%83%83%E3%82%AF)

...と, いうことで git commit 時に事前に用意したスクリプトを叩いてもらおう.

今回用意するスクリプトは, branch名末尾の数字を取得してcommitに埋め込むような動作をするもの.

## prepare-commit-msg を用意する

> フックはGitディレクトリのhooksサブディレクトリに格納されています。  
> 一般的なプロジェクトでは、.git/hooksがそれにあたります。  
> Gitはデフォルトでこのディレクトリに例となるスクリプトを生成します。  
> それらの多くはそのままでも十分有用ですし、引数も記載されています。  
> 全ての例は基本的にシェルスクリプトで書かれています。 (中略) フックスクリプトを有効にするには、Gitディレクトリのhooksサブディレクトリに適切な名前の実行可能なファイルを配置する必要があります。  
> これによってファイルが呼び出されることになります。
>
> -- [Git のカスタマイズ - Git フック | git-scm.com](https://git-scm.com/book/ja/v1/Git-%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA-Git-%E3%83%95%E3%83%83%E3%82%AF)

基本的にはシェルスクリプトで動くんだね.  
と, いうことなので早速ファイルを用意する.

次のファイルを用意 & 実行権限を付与.

- `$ cp .git/hooks/prepare-commit-msg.sample .git/hooks/prepare-commit-msg`
- `$ chmod +x .git/hooks/prepare-commit-msg`

環境によっては `hooks` というディレクトリがないかも.  
そのときは `$ git init` をすればok.  
ファイル名を prepare-commit-msg にした理由はこれ↓

> prepare-commit-msgフックは、コミットメッセージエディターが起動する直前、デフォルトメッセージが生成された直後に実行されます。  
> コミットの作者がそれを目にする前にデフォルトメッセージを編集することができます。
>
> -- [Git のカスタマイズ - Git フック | git-scm.com](https://git-scm.com/book/ja/v1/Git-%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA-Git-%E3%83%95%E3%83%83%E3%82%AF)

prepare-commit-msg の中身はシェルスクリプトを記述.  
今回の場合はこんな感じ↓

- `$ vi .git/hooks/prepare-commit-msg`

```
#!/bin/sh

mv $1 $1.tmp
echo "#`git branch | grep "*" | awk '{print $2}' | sed -e "s/.*\([0-9]\{1,\}\)\$/\1/g"`" > $1
cat $1.tmp >> $1
```

### コード解説

echoの中身はパイプで繋がっていて見にくいけど,

1. \# を出力
2. issue番号 抽出
    - `$ git branch` で \*(アスタリスク) の付いている行を抽出
    - `awk` コマンドでbranch名のみを抽出
    - `sed` コマンドで
        - `s` : 置換処理
        - 末尾の数字のうち, 1回以上繰り返されているものをグルーピング
        - `\1` は後方参照で, `()` でグルーピングしたものを指定
        - `g` : マッチした全文字列
3. commitメッセージ 出力

数字が何桁でも対応できるようにしたのがミソ

## 実際に試してみる

まず適当にファイルを作って, 確認.

```
$ git status

On branch feature/issue-4
Untracked files:
  (use "git add <file>..." to include in what will be committed)

        tst.md

nothing added to commit but untracked files present (use "git add" to track)
```

add して commit してみる.

```
$ git add tst.md 
$ git commit -m "テストファイル作成"

[feature/issue-4 007728e] #4 テストファイル作成
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 tst.md
```

ちゃんと `#4 テストファイル作成` という具合に issue番号 が追記されている.

## 追記: Gitlab上のcommitsで1行で表示させるために改修

↑ここまでの方法だと次の画像のようにcommitメッセージが改行されて表示されてしまう.

![](/images/pages/posts/20180214/modifyHooks.png)

なので, 画像上側のcommitメッセージのような表示にするために改修した.  
コードは次の通り.

```
#!/bin/sh

mv $1 $1.tmp
echo "#`git branch | grep "*" | awk '{print $2}' | sed -e "s/\([^0-9]\)//g"` `cat $1.tmp`" > $1
```

この改修で実現したことは次の2点.

- issue番号が2桁以上になっても表示可能
    - 前回までのコードだと1桁しか拾えなかった
- gitlab上で1行でcommitメッセージを表示
    - 前回までのコードだと `>>` のせいで行が分かれてしまった

今回は以上.
