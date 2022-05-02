---
title: 'GitLab へ SourceTree から push する方法'
tags: ['git', 'gitlab', 'windows']
created_at: '2016-08-07'
---

今回は次の点を紹介.

- GitLab でプロジェクト作成
- SourceTree にsshキー登録
- ローカルファイルをGitLabへpush

GitHub や GitLab へ push するまでに超えなければならないステップは多い.  
いくつかのステップについては他の記事で紹介した.

- [windowsでssh公開鍵 秘密鍵 を作成する方法](https://kengotakimoto.com/posts/generate_ssh_kyes_on_windows/)

## 動作環境

動作環境は次の通り.

- Windoews8.1 64bit
- SourceTree 1.8.3
- GitLab

## 手順

まず GitLab でプロジェクト作成する.

### 1\. GitLabへアクセスし、sign in.

![GitLab sign in](/images/pages/posts/20160807/gitLab_1.png)   

### 2\. New Project をクリック

![GitLab Create New Project](/images/pages/posts/20160807/pic_2.png) 画面右上 New Project をクリック   

### 3\. Project name / Project description / Create project

![GitLab edit new project](/images/pages/posts/20160807/pic_3.png)

- `Project name`: GitLab上に保存するディレクトリ名のようなもの.
  - 基本的にはローカルにあるフォルダ名と同じ名前にする
  - 今回は `tst` という名前を付けた
- `Project description (optional)`: どんなProjectなの？ 何用のファイルが入ってるの？ という説明を入れる箇所
  - 今回は解説用なので次のように入力
    - `tst for first push`
- `Visibility Level`: リポジトリへのアクセスレベルを設定.
  - 今回は完全プライベートな状況を想定して `Private` を選択

ここまで入力できたら `Create project` をクリック.
遷移後の画面で url が表示される.  
この url は後程使用するので覚えておく.

今回はssh接続を想定しているので矢印箇所を ssh に設定.  
GitLab での作業は一旦ここまで.

### 4\. デスクトップに tst フォルダ作成

![windows create local directory](/images/pages/posts/20160807/pic_4.png)

デスクトップにtstフォルダを作成する.  
このフォルダが GitLab と接続するフォルダになる.

### 5\. SourceTree 起動. ツール/SSH キー を追加

![SourceTree register ssh key](/images/pages/posts/20160807/pic_5.png)

これから SourceTree へ OpenSSH キーの登録を行なう.

まずSourceTreeを起動.

次に `ツール > SSH キーを追加` をクリック.

事前に作成した SSH 秘密鍵 を選択する.  
私の環境だと次の場所.

- `C:\\Users\\ユーザ名\\.ssh`

ここで選択するのは `ssh 公開鍵` ではないので注意.  
公開鍵の拡張子は `.pub`.

ファイル選択後, コマンドプロンプトが起動する.   

### 6\. コマンドプロンプトにパスフレーズ入力

![command prompt path phrese](/images/pages/posts/20160807/pic_6.png)

起動したコマンドプロンプトにパスフレーズを入力する.  
パスフレーズは ssh 公開鍵/秘密鍵 を作成した際に設定したもの.

### 7\. GitLabで作成したプロジェクトをクローン

![SourceTree clone](/images/pages/posts/20160807/pic_7.png)

先程 GitLab で作成したプロジェクトをローカルにクローンする.

- `SourceTree > 新規/クローンを作成する`
  - `元のパス/URL`: GitLab で作成したプロジェクト url をコピペ.

コピペする url は次の図の箇所.

![GitLab copy and past url](/images/pages/posts/20160807/pic_7_2.png)

- `保存先のパス`: 先程デスクトップに作成した `tst` フォルダを指定.
  - 多くの場合, PC内でソースコードを管理しているディレクトリを指定する

設定終了後 `クローン` をクリック.

以上で GitLab 使用環境は整った.

以降の作業ではローカルで編集したファイルを GitLab へ push する.

## GitLabへ commit & push してみる

### 1\. ローカルファイルを編集

![windows edit local file](/images/pages/posts/20160807/pic_8.png)

先程作成した tst フォルダ内に次のようなファイルを作成.

- firstFile.txt

```txt
This is first file for GitLab.
```

### 2\. SourceTreeで 作業中ファイルをステージに上げる

![SourceTree staging](/images/pages/posts/20160807/pic_9.png)

SourcTreeに戻ると上図のような表示になっています.  
下図の手順でファイルをステージに上げます.

1. 作業ツリーのファイル をチェック
2. Indexにステージしたファイル にファイルが移動したことを確認
  - ![SourceTree set staging](/images/pages/posts/20160807/pic_9_2.png)

ウィンドウ右下には編集したファイルの内容が表示されます.

`ステージする` というのは GitLab へ push する準備を整える, というイメージ.

### 3\. リモートリポジトリ を設定

![SourceTree set remote repogitory](/images/pages/posts/20160807/pic_10.png)

ここで、GitLab のどのリポジトリへ push するのかを設定する.

`設定 > 追加` をクリック.

- `URL/パス`: GitLabで、先程コピペしたものと同じものを再度コピペ

コピペ後 `OK` をクリック.

### 4\. commit&push

![SourceTree commit and push](/images/pages/posts/20160807/pic_11.png)

GitLab へ commit & push する.

1. 画面上方 コミット をクリック
2. コメントを入力
3. `変更を直ぐにプッシュする` にチェック
4. コミット をクリック

コミット時にコメントを入力することができる.  
今回は `first commit` と入力.

### 5\. GitLab でちゃんとコミットされていることを確認。完了。

![GitLab check be pushed](/images/pages/posts/20160807/pic_12.png)

GitLab へちゃんと push されていることを確認する.   

### 6\. GitLab で Project/Commit をクリック

![GitLab check comment](/images/pages/posts/20160807/pic_13.png)

GitLabの画面へ移動し `Project Commit` をクリック.

この時, `Commit(1)` と表示されていれば push は成功している.  
念のため、 `Commit(1)` をクリックして詳細を確認する.

Commit(1) をクリックすると次の画面へ遷移する.

![GitLab check pushed files](/images/pages/posts/20160807/pic_13_2.png)

コミット時に入力したコメントが表示されているのが分かる.  
さらに、コレをクリックするとpushしたファイルの中身を見ることが出来る.

作業は以上です。   

## まとめ

慣れないうちは GitLab 作業環境構築は少し大変.

今回は以上.
