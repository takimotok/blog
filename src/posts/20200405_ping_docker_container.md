---
title: 'docker 基本操作 コンテナ作成から ping を飛ばすところまでやってみる'
tags: ['docker']
created_at: '2020-04-05'
updated_at: ''
---

これまで docker-compose を触ってきたけど, 単体のコンテナに触れた方がいい気がする.  
今回はコンテナ作成から localhost へ ping を飛ばすところまでやってみる.

## 動作環境

- mac mojave 10.14.6
- docker desktop 2.2.0.0

## 前提条件

対象読者は次の通り.

- docker または docker-compose に触れたことがある人
- 単体のコンテナ操作方法を一通り知りたい人

次の本を参照しながら進める.

- 『自宅ではじめるDocker入門』
  - 第2章

事前に docker をホストマシンに inst. 済 の状態から進める.

## モチベーション

モチベーションは次の通り.

- コンテナ単体の操作に慣れたい
- ubuntu 操作に慣れたい
- なんとなく使ってきた docker コマンドの意味を知りたい

これまでは docker-compose に触れる機会が多かった.  
操作に慣れていた os は centos.  
これを機にコンテナ単体の操作と ubuntu 操作に慣れたい.

あとは, イチから lamp 環境構築できるのが vagrant やサーバだけだったから, docker を使っても思い通りの環境構築できるようになりたいってのもある.

## 今回やること

今回やることはこれ.

- ubuntu image でコンテナを立てる
- localhost に向けて ping を打つ
  - package が必要なので apt で repo. 更新とか

## image 削除

記事作成の関係上, local に container, image がない状態を作りたい.

image の削除は次の条件を満たさないとできない.

- 対象 image に結びつく他の image や container を先に削除すること

やってみる.

```sh
# container id 一覧
$ docker ps -aq

# container 全削除
$ docker ps -aq | xargs -I% docker rm %

# 確認
$ docker ps -aq

# image id 一覧
$ docker images -aq

# image 全削除
$ docker images -aq | xargs -I% docker rmi %

# 確認
$ docker images -aq
```

ok.

## コンテナ作成

次はコンテナ作成.  
ubuntu image を pull して, それをベースにコンテナを立てる.

利用する ubuntu は LTS がいいから `Ubuntu 18.04 LTS (Bionic Beaver)` を採用.

まずは image dl.

```sh
# container id 一覧
$ docker ps -aq

# image id 一覧
$ docker images -a

# image 取得
$ docker pull ubuntu:18.04

# 確認
$ docker images -a
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              18.04               4e5021d210f6        13 days ago         64.2MB
```

ok.

次に, この image をベースにコンテナを起動.

```sh
# 確認
$ docker ps -a

# ubuntu image をベースにした container 起動
# -it : 標準入力, 標準出力 を利用
$ docker run -it ubuntu:18.04 /bin/bash
root@2d5a2d1883ee:#

# コンテナから出る
root@2d5a2d1883ee:# exit

# コンテナ 一覧
# STATUS がコンテナ起動状況. [Exited]:停止, [Up]:起動中
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
2d5a2d1883ee        ubuntu:18.04        "/bin/bash"         2 minutes ago       Exited (0) 3 seconds ago                       eloquent_gauss

# コンテナ再起動
# -a: attach. フォアグラウンドで実行. このとき標準出力が設定されるから -t 不要
# -l: 最後に起動したコンテナを指定
$ docker start -ai $(docker ps -lq)
root@2d5a2d1883ee:#
```

コンテナ再起動前後で同じ container id になっていることから, 同一コンテナを触っていることが分かる.

## ping を打つ

初期状態の ubuntu は `ping` が打てない. というか, 基本的なネットワークコマンドとかは一切入っていない.  
必要に応じて追加してゆくスタイル.

```sh
root@2d5a2d1883ee:# ping localhost
bash: ping: command not found
```

リポジトリと package の更新をしてから, `iputils-ping` を inst. する.  
作業はすべて container 内で行う.

```sh
# repo. 更新
# apt update

# package 最新化
# apt upgrade

# iputils-ping inst.
# apt install iputils-ping

# 確認
# which ping
/bin/ping

# ping を飛ばす
# ping localhost
PING localhost (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.109 ms
64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.103 ms
64 bytes from localhost (127.0.0.1): icmp_seq=3 ttl=64 time=0.194 ms
```

ok.

## attach / detach

最後に attach, detach を試す.

### detach

container に入った状態で `Ctrl + p, Ctrl + q`

### attach

```sh
# container id 確認
$ docker ps -lq # 2d5a2d1883ee

# attach
$ docker attach 2d5a2d1883ee
```

## まとめ

コンテナ単体の操作方法がざっくり分かった.  
detach 方法は新しい学びになった.

今回参照した 『自宅ではじめるDocker入門』 は結構分かりやすい.  
引き続き眺めてみる.

今回は記事にしなかったけど, 本書 第2章 で説明されている layer (ベースイメージからの差分) の概念は分かりやすかった.  
チーム開発で image を共有する際は注意だね.  
とはいえ, これまで見てきた現場は docker-compose & Dockerfile を git 管理している所が多い.  
ある程度慣れてきたらそっちを見た方が早いかも.

今回は以上.
