---
title: 'docker desktop で data volume の実体が見当たらない'
tags: ['docker']
created_at: '2020-04-16'
updated_at: ''
---

Docker Desktop for Mac で data volume container の実体が見当たらない.  
mount point 配下に作成したデータは VM 上に存在するから host machie からは見えないというオチ.  
log 等は host machine へ永続化したいときもあるので mount point へ data volume container を接続して解決する.

## 結論

先に結論から.

今回利用している docker desktop for mac では data volume が VM 上に作成される.  
だから host machine からは data volume の実体が参照できない.  
データの永続化をしたいなら明示的に対象 dir. を host machine と mount する必要がある.

最終的に, 私は host machine の特定 dir. を mount point として data volume container を接続することで解決した.  
こんな感じ.

```sh
# data volume 初期状態確認
$ docker volume ls
DRIVER              VOLUME NAME

# local の dir. を指定して container 起動
$ docker run --name data-container-2 -v /Users/{pc name}/Desktop/prj/testDocker/data/:/tmp ubuntu:18.04

# container 起動状況 確認
# data volume container は Exited でも使える
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
a400b46598fd        ubuntu:18.04        "/bin/bash"         4 seconds ago       Exited (0) 4 seconds ago                       data-container-2

# mount 状況確認
# Source が mount point
$ docker inspect data-container-2

...
"Mounts": [
  {
  "Type": "bind",
  "Source": "/Users/{pc name}/Desktop/prj/testDocker/data",
  "Destination": "/tmp",
  "Mode": "",
  "RW": true,
  "Propagation": "rprivate"
  }
],
...

# data volume container として data-container-2 を指定したアプリケーション container を 2つ起動
$ docker run --name container_a -it --volumes-from data-container-2 -it ubuntu:18.04 /bin/bash
$ docker run --name container_b -it --volumes-from data-container-2 -it ubuntu:18.04 /bin/bash

# container 起動状況確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
2f7943d5b96e        ubuntu:18.04        "/bin/bash"         14 seconds ago      Up 14 seconds                                  container_b
910627c3b7da        ubuntu:18.04        "/bin/bash"         22 seconds ago      Up 22 seconds                                  container_a
a400b46598fd        ubuntu:18.04        "/bin/bash"         3 minutes ago       Exited (0) 3 minutes ago                       data-container-2

# container_a で mount point にファイルを作成し,
# container_b でそのファイルを確認
# ついでに host machine の mount point からも確認.
# たとえばこんな感じ ↓

# contaier_a で
/# echo "hogeee" >> /tmp/by_a.md

# contaier_b で
/# cat /tmp/by_a.md
hogeee

# host machine で
$ cat /Users/{pc name}/Desktop/prj/testDocker/data/by_a.md
hogeee
```

## 動作環境

- docker desktop for mac v2.2.0.5
- Docker version 19.03.8, build afacb8b

## 前提条件

次の点を前提とする.

- docker コマンドでゴリゴリ操作
  - Dockerfile, docker-compose.yml は使わない
- ubuntu:18.04 イメージを使用

次の点は知っていると便利かも.

- `$ docker volume create` をせずとも, docker コマンド内でマウントポイントが指定された場合は自動的に data volume が作成される.

## 本記事でやること

本記事でやることは次の通り.

- data volume が host machine から見えない事を確認
- 明示的に mount point を指定した data volume container 作成
  - ここで複数 container からデータの参照ができることを確認
- bind について公式 doc. を参考に学ぶ

## 背景

data volume の実体はどこにあるんだろう? と思って探しても見当たらない.  
どこだい.

解決に至るまでの過程はこんな感じ.

1. docker-compose ばかり触ってきたから単体の container の操作も修得したい
2. data volume の実体ってどこにあるんだろ ? と思って探したら VM 内にあった
3. host machine から data volume 触るには明示的に mount するしかない

## 手順

本記事でやることは次の通り.

- 普通に data volume container を作ると host machine から参照できない, って気付く
- 明示的に mount point を指定すると host 側から確認可能だ, って気付く

以下, 一つずつ試す.

## 普通に data volume container を作ると host machine から参照できない, って気付く

まずは data volume container を作って中身の確認をしてみる.

![](/images/pages/posts/20200416/dataVolumeContainer.png)

ちょっと作業イメージを解説.  
横棒の上側が VM の世界. 横棒の下側が host machine (mac).  
docker for mac は host machine 上に VM を起動し, その上で container を構築している.  
これを踏まえて, ここでやるのは ↓コレ.

- ubuntu image 取得
- data volume container 作成
  - 明示的に data volume を作成
  - この data volume は VM 上に作成される
- アプリケーション container を2つ (a, b) 作成
- a, b 各 container から data volume container 配下のデータが参照可能であることを確認
  - container\_a が data volume container 配下に作成したデータを container\_b から参照
- data volume の実体はどこだろ, って探す
  - ここで 「そんなものはナイ」 って気付く

いざ, 実践.

```sh
# 初期状態
$ docker image ls -aq
$ docker ps -aq
$ docker volume ls -q

# ubuntu image 取得
$ docker pull ubuntu:18.04

# 確認
$ docker image ls
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              18.04               4e5021d210f6        3 weeks ago         64.2MB

# data volume 作成
# 名前は `data-volume`
$ docker volume create --name=data-volume

# 確認
$ docker volume ls -q
data-volume

# data volume container 起動
# container 名は `data-container`
$ docker run --name data-container -v data-volume:/tmp ubuntu:18.04

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
d2e4836aa2f9        ubuntu:18.04        "/bin/bash"         5 seconds ago       Exited (0) 4 seconds ago                       data-container

# アプリケーション contaier a, b を作成
# container 作成時, 上で作成した data volume container を指定
$ docker run --name container_a -it --volumes-from data-container -it ubuntu:18.04 /bin/bash
$ docker run --name container_b -it --volumes-from data-container -it ubuntu:18.04 /bin/bash

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
b2d82321dd34        ubuntu:18.04        "/bin/bash"         7 seconds ago       Up 7 seconds                                   container_b
ab67a539f05e        ubuntu:18.04        "/bin/bash"         24 seconds ago      Up 23 seconds                                  container_a
d2e4836aa2f9        ubuntu:18.04        "/bin/bash"         7 minutes ago       Exited (0) 7 minutes ago                       data-container
```

data volume container (今回は `data-container` って名前の container) は停止状態 (`Exited`) でも使える.

ここで container\_a から `/tmp` へファイルを作成し, それが container\_b から参照可能か確認する.

```sh
# container_a に attach & ファイル作成
$ docker attach container_a
/# echo "foo" > /tmp/from_a.txt

# container_b から確認
$ docker attach container_b
/# cat /tmp/from_a.txt
foo
```

参照できた.

アプリケーション container 起動時に data volume container を指定することで mount point を意識する必要がなくなるのがメリット.  
もし各アプリケーション container に data volume を個別指定するなら mount point を統一する必要がある.  
(統一しなくてもいいけど, 他方のアプリケーション container が作成したファイルやディレクトリが参照できない)

ここで 「data volume container の実体は host machine 上のどこにあるんだろう ?」という疑問でハマる.

data voume container のマウント情報を確認.

```sh
$ docker inspect data-container

...
"Mounts": [
  {
    "Type": "volume",
    "Name": "data-volume",
    "Source": "/var/lib/docker/volumes/data-volume/_data",
    "Destination": "/tmp",
    "Driver": "local",
    "Mode": "z",
    "RW": true,
    "Propagation": ""
  }
],
...
```

`Source` で示された path は mac 上に存在しない.  
docker desktop for mac は HyperKit 使って VM 上に container 立ててるんだね.

> Here are some key points to know about Docker Desktop on Mac before you get started:
>
> - Docker Desktop uses HyperKit instead of Virtual Box. Hyperkit is a lightweight macOS virtualization solution built on top of Hypervisor.framework in macOS 10.10 Yosemite and higher.
> - When you install Docker Desktop on Mac, machines created with Docker Machine are not affected.
> - Docker Desktop does not use docker-machine to provision its VM. The Docker Engine API is exposed on a socket available to the Mac host at /var/run/docker.sock. This is the default location Docker and Docker Compose clients use to connect to the Docker daemon, so you can use docker and docker-compose CLI commands on your Mac.
>
> -- [The Docker Desktop on Mac environment](https://docs.docker.com/docker-for-mac/docker-toolbox/#the-docker-desktop-on-mac-environment)

`/Users/{pc name}/Library/Containers/com.docker.docker/Data/vms/0` に `tty` があるから起動してみる.

```sh
# tty を実行. VM の中に入る
$ screen /Users/{pc name}/Library/Containers/com.docker.docker/Data/vms/0/tty

Welcome to LinuxKit

                        ##         .
                  ## ## ##        ==
               ## ## ## ## ##    ===
           /"""""""""""""""""__/ ===
          {                       /  ===-
           _____ O           __/
                        __/
              _________/

docker-desktop login: root (automatic login)

Welcome to LinuxKit!

NOTE: This system is namespaced.
The namespace you are currently in may not be the root.
System services are namespaced; to access, use `ctr -n services.linuxkit ...`
login[2515]: root login on 'ttyS0'



# Source の path を眺める
~# ls -lah /var/lib/docker/volumes/data-volume/_data/
total 12
drwxrwxrwt    2 root     root        4.0K Apr 16 08:44 .
drwxr-xr-x    3 root     root        4.0K Apr 16 01:56 ..
-rw-r--r-- 1 root     root           4 Apr 16 08:44 from_a.txt


# screen コマンドを抜ける
C-a + k
```

Source で表示された path にさっき container\_a で作成したファイルがあった.  
VM 上にファイルがあるなら host machine にマウントせねば.

## 明示的に mount point を指定すると host 側から確認可能だ, って気付く

log ファイルや永続化したいデータを host machine に置きたい場合もある.  
docker for mac が VM 上に container を立てるのなら, 明示的に host machine に mount しなければ.

![](/images/pages/posts/20200416/mounted.png)

また作業イメージの解説から.  
横棒の上側が VM の世界. 横棒の下側が host machine (mac).  
さっきと違って host machine 上の特定 dir. を mount point として指定.  
具体的には次の場所を VM に mount.

- `/Users/{pc name}/Desktop/prj/testDocker/data/`

ココを mount point とした data volume container を立てればよいのでは.  
こんな感じ.

```sh
# 一旦 container を全削除
$ docker stop container_a container_b && docker container prune -f

# 確認
$ docker ps -aq

# desktop 上の data dir. を mount point とした data volume container を立てる
# 名前は data-container-2
# container 上の /tmp へ mount
$ docker run --name data-container-2 -v /Users/{pc name}/Desktop/prj/testDocker/data/:/tmp ubuntu:18.04

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
f940e5bda81f        ubuntu:18.04        "/bin/bash"         4 seconds ago       Exited (0) 3 seconds ago                       data-container-2

# host machine の dir. を mount point とした data volume container (data-container-2) を
# data volume に指定したアプリケーション container (a, b) を立てる
$ docker run --name container_a -it --volumes-from data-container-2 -it ubuntu:18.04 /bin/bash
$ docker run --name container_b -it --volumes-from data-container-2 -it ubuntu:18.04 /bin/bash

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                      PORTS               NAMES
d7da4eabd2e9        ubuntu:18.04        "/bin/bash"         7 seconds ago       Up 6 seconds                                    container_b
34c3fb31a7b6        ubuntu:18.04        "/bin/bash"         20 seconds ago      Up 18 seconds                                   container_a
f940e5bda81f        ubuntu:18.04        "/bin/bash"         12 minutes ago      Exited (0) 12 minutes ago                       data-container-2

# container_a から適当なファイルを作成して, host machine から参照できるか確認
$ docker attach container_a
/# echo "from container_a fooo baaa" > /tmp/smpl.txt

# host machine から確認
$ cat ~/Desktop/prj/testDocker/data/smpl.txt
from container_a fooo baaa
```

無事に host machine から参照できた.  
ついでに container 削除後もデータが永続化されているか確認.

```sh
# container 起動状態確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                      PORTS               NAMES
d7da4eabd2e9        ubuntu:18.04        "/bin/bash"         3 minutes ago       Up 3 minutes                                    container_b
34c3fb31a7b6        ubuntu:18.04        "/bin/bash"         4 minutes ago       Up 4 minutes                                    container_a
f940e5bda81f        ubuntu:18.04        "/bin/bash"         16 minutes ago      Exited (0) 16 minutes ago                       data-container-2

# mount 状況確認
# Source が mount point
$ docker inspect data-container-2

...
"Mounts": [
  {
  "Type": "bind",
  "Source": "/Users/{pc name}/Desktop/prj/testDocker/data",
  "Destination": "/tmp",
  "Mode": "",
  "RW": true,
  "Propagation": "rprivate"
  }
],
...

# container 一掃
$ docker stop container_a container_b && docker container prune -f

# 確認
$ docker ps -aq

# host machine からさっきの data volume container にマウントしていた dir. を確認
$ ls -lh ~/Desktop/prj/testDocker/data/
total 16
-rw-r--r-- 1 {pc name}  staff    27B Apr 16 21:39 smpl.txt
```

ちゃんと永続化できてる.

mount 状態を確認すると ↓こう なってる.

- `"Type": "bind"`
- `"Source": "/Users/{pc name}/Desktop/prj/testDocker/data"`

後者は mount point だね. ちゃんと指定した dir. が表示されてる.  
前者の bind がちょっと謎. 最後にこの点を深堀りしてみる.

## bind について

mount point に data volume container を接続しただけだから, VM 上で確認した場合と同じ `Type": "volume"` だと予想していたけど, 違った.  
ここでは `$ docker inspect` で確認した `"Type": "bind"` について少し調査.

公式 doc. に書いてあった.

> Bind mounts have limited functionality compared to volumes.  
> When you use a bind mount, a file or directory on the host machine is mounted into a container.  
> The file or directory is referenced by its full or relative path on the host machine.  
> By contrast, when you use a volume, a new directory is created within Docker’s storage directory on the host machine, and Docker manages that directory’s contents.
>
> -- [Use bind mounts](https://docs.docker.com/storage/bind-mounts/)

`bind mount` って呼称なんだね.  
概要は分かったけど... じゃあ `-v` と `--mount` って何が違うの ?  
これも doc. に書いてある.

> Because the -v and --volume flags have been a part of Docker for a long time, their behavior cannot be changed.  
> This means that there is one behavior that is different between -v and --mount. If you use -v or --volume to bind-mount a file or directory that does not yet exist on the Docker host, -v creates the endpoint for you.  
> It is always created as a directory. If you use --mount to bind-mount a file or directory that does not yet exist on the Docker host, Docker does not automatically create it for you, but generates an error.
>
> -- [Differences between -v and --mount behavior](https://docs.docker.com/storage/bind-mounts/#differences-between--v-and---mount-behavior)

`--mount` を使うと Docker host 上に mount point (doc. には `endpoint` って書いてある) の自動作成はされずエラーを吐くよ, とのこと.

公式 doc. によると, これから docker 触り始める人は `--mount` を使うべし, って書いてある.  
`-v` に比べて `--mount` の方が厳密な印象.  
option 指定も細かくできそうだから, 私も今後は `--mount` を使うかも.

## まとめ

docker for mac が VM 上に container を立てるっていうのが盲点だった.  
これを知っていれば host 側に mount する必要があるってすぐに気付ける.

このあたりの用語は事前に押さえておくのが吉.

- data volume
- data volume container
- mount
- mount point
  - 公式 doc. では `endpoint` って表現されてる

今回は以上.
