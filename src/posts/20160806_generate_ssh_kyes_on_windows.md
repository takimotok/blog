---
title: 'windows で ssh 公開鍵, 秘密鍵を作成する方法'
tags: ['windows', 'ssh']
created_at: '2016-08-06'
updated_at: ''
---

今回は Git を使った ssh 公開鍵/秘密鍵 作成方法について.

## 動作環境

- Windoews8.1 64bit
- git for windows 2.9.2

## ssh公開鍵/秘密鍵の作成方法はいくつかあります

ssh 公開鍵/秘密鍵 作成方法はいくつかある.  
たとえばこんな感じ.

- Git付属 ssh-keygen.exe の利用
- PuTTY puttygen.exe の利用
- TeraTerm SSH鍵生成メニュー の利用
- Rlogin の利用
- Windows PowerShell の利用

windows も ssh 環境に恵まれてきた模様.

cf.) [Looking Forward: Microsoft Support for Secure Shell (SSH) | Windows PowerShell Blog](https://blogs.msdn.microsoft.com/powershell/2015/06/03/looking-forward-microsoft-support-for-secure-shell-ssh/)

いくつか ssh key 作成方法を検討したけど, 上述の1番目の方法が最も楽だった.  
以下, 手順詳細.

## 手順

手順はこんな感じ.

1. Git GUI を起動
2. Help -> Show SSH Key
3. Generate Key
4. パスフレーズ 入力/未入力 を選択
5. 完了

### 1\. Git GUI を起動

![windows git ssh GIT GUI](/images/pages/posts/20160806/gitSsh_1.png)

1. Win + C で画面右側にメニューを表示
2. `検索` を選択
3. `Git GUI` と入力
4. `Git GUI` を選択   

### 2\. Help -> Show SSH Key

![windows git ssh help ssh key](/images/pages/posts/20160806/gitSsh_2.png)

1. ツールバー
2. `Help Show SSH Key`

### 3\. Generate Key

![windows git ssh generate key](/images/pages/posts/20160806/gitSsh_3.png)

- `Generate Key` をクリック   

### 4\. パスフレーズ 入力/未入力 を選択

画像撮り損ねた...

パスフレースとは, `git push` の際に要求されるパスワードのこと.  
`git push` をする度に毎回パスフレーズを入力するのが面倒な人は、未入力で OK ボタンをクリック.

パスフレーズなしで ssh 鍵を作るのはセキュリティ的に危険だと思う.  
ここで任意の文字列を入力して OK をクリックした.

パスフレーズの入力は2回要求されるから, 1回目と2回目で同じ文字列を入力しよう.

### 5\. 完了

![windows git ssh finish](/images/pages/posts/20160806/gitSsh_5.png)

① : 公開鍵/秘密鍵 の格納場所
② : 公開鍵の中身

私の環境だと鍵置き場はここ.

```sh
C:\\Users\\(ユーザ名)\\.ssh
```

このディレクトリには次の名前で鍵が格納されています.

- `id_rsa`: 秘密鍵
- `id_rsa.pub`: 公開鍵

秘密鍵は公開しちゃダメ, 絶対.

## まとめ

GUI で ssh 鍵が作成できるのは楽.

個人的には Rlogin を常用しているからそれで作成しても良かったんだけど, 今回は Git を利用して作成してみた.  
作業自体は簡単だから ssh を利用した接続をしたい方は是非.  

今回は以上.
