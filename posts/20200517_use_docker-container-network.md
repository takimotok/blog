---
title: 'docker で container 間通信がしたい'
tags: ['docker']
created_at: '2020-05-17'
---

docker で container 間通信をするには対象 container を同一 network に置く必要がある.  
本記事では静的ページ, wordpress, phpmyadmin へのリクエストを nginx の reverse proxy で振り分ける.  
単体の container 操作や docker network に詳しくなるために docker-compose は使わない方針.

概要は次の通り.

## 結論

こんな構成にした. この数の container を管理するなら docker-compose を使った方がいい.

![](/images/pages/posts/20200517/Screen-Shot-2020-05-15-at-23.28.59.png)

上図水平線は VM と host machine の区切線.  
水平線から見て...

- 上方: VM (hyperkit)
- 下方: host machine (mac)

四角の箱は container とその名前.  
外側の大きな四角はホストマシンを想定しているけど, 説明の関係で図の下方に `host machine` って箱を描いちゃったから微妙かも.  
外側の大きな四角から見て外側は chrome とかがいるような認識で ok.

network は2つ作成.

- proxy-nw
- wp-nw

同一 network に所属する container 同士は container 名で通信可能.

2つの network に所属する container 内訳はこんな感じ.

- proxy-nw
    - apache
    - wp
    - phpmyadmin
- wp-nw
    - wp
    - phpmyadmin
    - mysql

同時に2つの network に所属させるために `$ docker network connect xxx` コマンドを使用.

nginx は reverse proxy として採用.  
`/`, `/blog`, `/phpmyadmin` へのリクエストを該当する container へ振り分ける.  
各 uri はこんな想定.

- `/`
    - 静的ページ
    - apache container へリクエストを流す
    - document root は host machine の `./web` dir. へマウント
- `/blog`
    - wordpress
    - DB は mysql を採用
- `/phpmyadmin`
    - DB の中身を UI で確認したい時に
    - json とか細かいデータをちょろっと書き換えるときは便利

logs container は host machine の `./logs` dir. とマウントした data volume container.  
nginx や 静的ページのログは手元で確認したいから logs container と接続.

次のデータは永続化させたいから host machine とマウント.

- nginx, apache のログ
- apache document root
- mysql データ

次の確認ができれば ok.

- ブラウザから `/`, `/blog`, `/phpmyadmin` への表示確認
- logs に期待したログが格納されている

今回は練習のために Dockerfile & docker コマンドでゴリゴリ構成したけど, この数の container を立てるなら docker-compose を使った方が楽.  
期待する構成が出来上がるまでに image, container の破棄・生成を繰り返すんだけど, そのために長いコマンドを打つのは辛い.  
それに加えて, container 起動順序まで気を配ると疲弊する. dokcer-compose なら container 起動順序も明示的に管理できる.  
今回の作業で docker network への理解が深まっただけじゃなく, docker-compose の有り難みが分かった.

結論は以上.  
以下, 詳細.

## 動作環境

- mac mojave 10.14.6
- docker desktop for mac v2.2.0.5
- Docker version 19.03.8, build afacb8b

mac の作業 dir. はここ.

- `~/Desktop/prj/testDocker`

## 前提条件

以下の点を前提とする.

- docker inst. 済
- docker 公式 doc. の tutorial を眺めたことがある
- nginx や wordpress の設定をなんとなくやったことがある

## 方針

こんな方針で作業を進める.

- docker-compose は使わない
    - container や image の取り扱い & docker network への理解を深めたいから
- Dockerfile & docker command でゴリゴリ構築する
    - 理解を優先したいから

## 今回のポイントは docker network に慣れること

今回のポイントはこれ.

- network を作成する
- 同一 network 内 container 間で通信する場合は container 名を指定する

## 今回の注意点は container 起動順序

container 間通信や network へ container を追加する際, 対象 container, network が事前に存在する必要がある. こんな感じ.

- nginx を proxy として動かす場合, 事前に apache, wp, pma container を起動しておく必要がある
- nginx, apache から log を格納するには logs container を起動しておく必要がある
- nginx, apache, wp, pma container を同一 network に所属させる場合, proxy-nw を作成しておく必要がある

wp-nw, mysql container についても一緒.

今回なら上図の下方にある container から起動すればいい.  
この辺意識しないと怒られるので注意.

## 下準備: 作業ディレクトリ作成

下準備として作業 dir. を作成する.  
今回はこんな感じ.

```
$ pwd
/Users/{pc name}/Desktop/prj/testDocker

$ tree -L 2 ./
./
├── db
│   ├── Dockerfile
│   ├── mysql # dir.
│   └── mysql.cnf
├── apache
│   ├── Dockerfile
│   └── httpd.conf
├── logs
│   ├── apache # dir.
│   └── nginx  # dir.
├── nginx
│   ├── Dockerfile
│   └── default.conf
├── phpmyadmin
│   └── Dockerfile
├── web
│   └── index.html
└── wordpress
    └── Dockerfile
```

第一階層はディレクトリ.  
第二階層の `dir.` はディレクトリ. それ以外はファイル.

どの dir. がどの container とマウントされるかは上図の通り.

各ファイルの中身は後述.

## network 作成

まず container 間通信をするために network を作成. これで同一 network 内では container 名でアクセス可能になる.  
今回は次の2つを作成.

- proxy-nw
- wp-nw

```
# 現状確認
$ docker network ls
NETWORK ID          NAME                           DRIVER              SCOPE
1e8ad5079aa6        bridge                         bridge              local
13cf8eebf074        host                           host                local
8ff2b7c4148b        none                           null                local

# network 作成
$ docker network create proxy-nw && \
  docker network create wp-nw

# 確認
$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
bbbfc4923b87        bridge              bridge              local
13cf8eebf074        host                host                local
8ff2b7c4148b        none                null                local
cb98e07d1b9b        proxy-nw            bridge              local
fd6a853c6095        wp-nw               bridge              local
```

## logs container 起動

最初に起動する container は logs.  
mysql container が先でもいいんだけど, こっちの方が簡単なので.

data volume container は `STATUS = Exited` でも使えるのが特徴.  
data volume container は 複数の container から参照される場合に重宝する. 参照元の container が mount point を意識する必要がないのは嬉しい.

container を作る. 今回は `busybox` のイメージを採用.

```
# busybox image 取得
$ docker pull busybox

# 確認
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
busybox             latest              be5888e67be6        2 weeks ago         1.22MB

# container 作成
$ docker run \
  --name logs \
  --mount type=bind,source="$(pwd)"/logs,target=/tmp/logs \
  -d \
  busybox

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                     PORTS               NAMES
9fc4853d31aa        busybox             "sh"                5 seconds ago       Exited (0) 4 seconds ago                       logs
```

## apache container 起動

静的ページ表示用 container.  
httpd 公式イメージを採用.

document root は host machine の `./web` にマウント.  
実務ではここの src を git 管理する想定.

log が見れるとなにかと便利なのでさっき作った logs container と接続.

### container 作成

Dockerfile はこんな感じ.

```
FROM httpd

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf

# log 出力先 dir. 作成
RUN mkdir -p /tmp/logs/apache

EXPOSE 80
```

httpd.conf はデフォルト状態から log 出力先を `/tmp/logs/apache/access_log` へ変更.  
ちょっと長いから [github](https://github.com/takimotok/smpl_docker_networks) を見て頂けますと.

apache container 作成.

```
# container 作成
$ docker run \
    --name apache \
    --mount type=bind,source="$(pwd)"/web,target=/usr/local/apache2/htdocs \
    --net=proxy-nw \
    --volumes-from logs \
    -d \
    apache-image

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                   PORTS                 NAMES
87299931672c        apache-image        "httpd-foreground"       2 seconds ago       Up 1 second              80/tcp                apache
0931e2d2ce19        mysql-image         "docker-entrypoint.s…"   2 hours ago         Up 2 hours               3306/tcp, 33060/tcp   mysql
42891337d93a        busybox             "sh"                     2 hours ago         Exited (0) 2 hours ago                         logs
```

ブラウザアクセスしたときに表示されるファイルを作成.

```
$ pwd
/Users/{pc name}/Desktop/prj/testDocker

$ echo "foo" > ./web/index.html
```

この時点ではポートの露出をしていないからブラウザから `localhost:80` でアクセスできないので注意.

### netowrk 確認

network の確認方法は 2種類. コマンドはほとんど一緒なんだけどね.

- network に注目する
    - `$ dokcer network inxpect ネットワーク名`
    - 出力された中で `Containers` を見ればいい
- container に注目する
    - `$ docker container inspect`
    - 出力された中で `Networks` を見ればいい

この network に期待する container が全部所属しているかなー, が知りたければ前者を.  
この container は期待する network に所属しているかなー, が知りたければ者を.

今回は一つの network に複数の container を所属されるから前者で確認.

```
$ docker network inspect proxy-nw

...
"Containers": {
    "87299931672c13be3e7b671e241b8363c864db59884d2c7de97806b0dffec0d8": {
        "Name": "apache",
        "EndpointID": "e3d958f5ab36d8c73abc19ffae90005f43361c62cec4f0d17ace1998fe4bac02",
        "MacAddress": "02:42:ac:14:00:02",
        "IPv4Address": "172.20.0.2/16",
        "IPv6Address": ""
    }
},
...
```

ちゃんと apache container が wp-nw に所属している.

## mysql container

wordpress データ格納用 container.  
mysql:5.7 公式イメージを採用.

### container 作成

Dockerfile 作成のモチベーションはこれ.

- 日本語データ扱いたい
- デバッグが辛いから vim が欲しい

Dockerfile の中身はこれ.

```
FROM mysql:5.7

# 日本語化
RUN apt-get update && apt-get -y upgrade \
  && apt-get -y install locales locales-all \
  && echo 'export LANG=ja_JP.UTF-8' >> ~/.bashrc \
  && echo 'export LANGUAGE="ja_JP:ja"' >> ~/.bashrc \
  # vim が欲しい
  && apt-get -y install vim

ENV MYSQL_ROOT_PASSWORD=docker01

COPY ./mysql.cnf /etc/mysql/conf.d/mysql.cnf
```

`mysql.cnf` は mysql client, server 間の文字コード統一が目的.  
中身はこれ.

```
[client]
default-character-set = utf8mb4


[mysqld]
# force client charset to the server's one
skip-character-set-client-handshake

character-set-server = utf8mb4
collation-server = utf8mb4_general_ci


[mysqldump]
default-character-set = utf8mb4


[mysql]
default-character-set = utf8mb4
```

image を build して container 起動.

```
# build & run container
$ docker build -t mysql-image ./db/ && \
  docker run \
  --name mysql \
  --mount type=bind,source="$(pwd)"/db/mysql,target=/var/lib/mysql \
  --net=wp-nw \
  -d \
  mysql-image

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS                 NAMES
0931e2d2ce19        mysql-image         "docker-entrypoint.s…"   4 seconds ago       Up 2 seconds                3306/tcp, 33060/tcp   mysql
42891337d93a        busybox             "sh"                     57 seconds ago      Exited (0) 56 seconds ago                         logs
```

ここでは次の点を確認.

- 期待した network に所属しているか
- mysql container 内部で日本語が使えるか

ちょっと詳しく見てゆく.

### netowrk 確認

network の確認方法は apache container でやったときと一緒.

```
$ docker network inspect wp-nw

...
"Containers": {
    "0931e2d2ce19ed31a7b6632f56b1567421788c3ac68f330447dde278f69082e9": {
        "Name": "mysql",
        "EndpointID": "cb8d20caba538bf727d947fbe0085697aa2d02e967c35b9fe276f0b69da48207",
        "MacAddress": "02:42:ac:12:00:02",
        "IPv4Address": "172.18.0.2/16",
        "IPv6Address": ""
    }
},
...
```

ちゃんと mysql container が wp-nw に所属している.

### 日本語が使えるか 確認

起動中の mysql container に入って確認.

```
# container に入る
$ docker exec -it mysql /bin/bash

# mysql ログイン
mysql -uroot -pdocker01

# 日本語が打てるか確認
mysql> select * from ほげ
```

今回は Dockerfile で locale の指定と vim inst. を行ったので, それらで確認しても ok.

## phpmyadmin container

ブラウザで DB の中を見たいとき用.

Dockerfile を基に image を build して container を作る.

Dockerfile はこんな感じ.  
mysql conatiner と同一 network に所属させるから, `PMA_HOST` に mysql container 名を指定するのがポイント.

```
FROM phpmyadmin/phpmyadmin

ENV PMA_HOST=mysql \
  PMA_USER=root \
  PMA_PASSWORD=docker01 \
  PMA_ABSOLUTE_URI=http://localhost/phpmyadmin
```

build して container を起動する.

```
# build image & run container
$ docker build -t pma-image ./phpmyadmin/ && \
  docker run \
    --name pma \
    --net=wp-nw \
    -d \
    pma-image

# 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                   PORTS                 NAMES
14aba9bb5e4f        pma-image           "/docker-entrypoint.…"   27 seconds ago      Up 27 seconds            80/tcp                pma
87299931672c        apache-image        "httpd-foreground"       19 minutes ago      Up 19 minutes            80/tcp                apache
0931e2d2ce19        mysql-image         "docker-entrypoint.s…"   2 hours ago         Up 2 hours               3306/tcp, 33060/tcp   mysql
42891337d93a        busybox             "sh"                     2 hours ago         Exited (0) 2 hours ago                         logs
```

この時点で wp-nw に所属している.  
pma container は proxy-nw にも所属させたいので次のコマンドを実行.

```
# proxy-nw に所属
$ docker network connect proxy-nw pma

# 確認
$ docker container inspect pma

...

"Networks": {
    "proxy-nw": {
        "IPAMConfig": {},
        "Links": null,
        "Aliases": [
            "14aba9bb5e4f"
        ],
        "NetworkID": "cb98e07d1b9b06ec15b9bc7c7a9550a1e4004d52c93904d70644f188088a20d5",
        "EndpointID": "e55a8136500bfcd2f91fc7bcabf429f153a21d4c09e05fb7f5aadd55e054dffa",
        "Gateway": "172.20.0.1",
        "IPAddress": "172.20.0.3",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:14:00:03",
        "DriverOpts": {}
    },
    "wp-nw": {
        "IPAMConfig": null,
        "Links": null,
        "Aliases": [
            "14aba9bb5e4f"
        ],
        "NetworkID": "fd6a853c6095741721883dfa04ad0cd184fbbdba431146b1f220d62689f1f58c",
        "EndpointID": "7bc10148ebc03c845688ff78db2566485a524796c01493aa6a14a5ca7c4f34e1",
        "Gateway": "172.18.0.1",
        "IPAddress": "172.18.0.3",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:12:00:03",
        "DriverOpts": null
    }
}
...
```

ちゃんと `proxy-nw`, `wp-nw` に所属している.

## wp container

wordpress の container.  
`localhost/blog` で動かしたい. wordpress 公式イメージを採用.

サブディレクトリで動かすには `wp-config.php` を書き換える必要があるんだけど, image の環境変数指定で実現できそう.

> \-e WORDPRESS\_CONFIG\_EXTRA=...  
> (defaults to nothing, non-empty value will be embedded verbatim inside wp-config.php -- especially useful for applying extra configuration values this image does not provide by default such as WP\_ALLOW\_MULTISITE; see docker-library/wordpress#142 for more details) [wordpress | dockerhub](https://hub.docker.com/_/wordpress/)

Dockerfile はこんな感じ.

```
FROM wordpress

# 日本語化
RUN apt-get update && apt-get -y upgrade \
  && apt-get -y install locales locales-all \
  && echo 'export LANG=ja_JP.UTF-8' >> ~/.bashrc \
  && echo 'export LANGUAGE="ja_JP:ja"' >> ~/.bashrc \
  # vim が欲しい
  && apt-get -y install vim

ENV WORDPRESS_DB_HOST=mysql \
    WORDPRESS_DB_USER=root \
    WORDPRESS_DB_PASSWORD=docker01 \
    WORDPRESS_CONFIG_EXTRA="define('WP_HOME','http://localhost/blog/');define('WP_SITEURL','http://localhost/blog/');"
```

デバッグが辛かったから locale 変えて vim 入れた.  
`WORDPRESS_DB_HOST=mysql` は mysql container 名を指定している点がポイント.

今回の本質ではないけど, サブディレクトリで動かすために `WORDPRESS_CONFIG_EXTRA` を指定した.  
ここで指定した内容が wp-config.php に追記される.

build & container 作成.

```
$ docker build -t wp-image ./wordpress && \
  docker run \
    --name=wp \
    --net=wp-nw \
    -d \
    wp-image

## 確認
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                   PORTS                 NAMES
d71fee3e9118        wp-image            "docker-entrypoint.s…"   50 seconds ago      Up 49 seconds            80/tcp                wp
14aba9bb5e4f        pma-image           "/docker-entrypoint.…"   35 minutes ago      Up 35 minutes            80/tcp                pma
87299931672c        apache-image        "httpd-foreground"       54 minutes ago      Up 54 minutes            80/tcp                apache
0931e2d2ce19        mysql-image         "docker-entrypoint.s…"   3 hours ago         Up 3 hours               3306/tcp, 33060/tcp   mysql
42891337d93a        busybox             "sh"                     3 hours ago         Exited (0) 3 hours ago                         logs
```

wp-config.php が書き換えられているか確認.

```
$ docker exec -it wp /bin/bash -c "cat wp-config.php | grep -i 'wp_home'"

define(WP_HOME,http://localhost/blog/);define(WP_SITEURL,http://localhost/blog/);
```

セミコロンで改行して欲しかったけど...ひとまず ok.

proxy-nw にも所属させる.

```
$ docker network connect proxy-nw wp

# 確認
"Networks": {
    "proxy-nw": {
        "IPAMConfig": {},
        "Links": null,
        "Aliases": [
            "d71fee3e9118"
        ],
        "NetworkID": "cb98e07d1b9b06ec15b9bc7c7a9550a1e4004d52c93904d70644f188088a20d5",
        "EndpointID": "739754c5dbd2a813e2d55a646b61081621bf176c312bb30d8f1c480a088dfee3",
        "Gateway": "172.20.0.1",
        "IPAddress": "172.20.0.4",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:14:00:04",
        "DriverOpts": {}
    },
    "wp-nw": {
        "IPAMConfig": null,
        "Links": null,
        "Aliases": [
            "d71fee3e9118"
        ],
        "NetworkID": "fd6a853c6095741721883dfa04ad0cd184fbbdba431146b1f220d62689f1f58c",
        "EndpointID": "f259399e179769dd3c6efdfc93ca90e91957eab5cc7a9ce17c5b61bbaae47afe",
        "Gateway": "172.18.0.1",
        "IPAddress": "172.18.0.4",
        "IPPrefixLen": 16,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:ac:12:00:04",
        "DriverOpts": null
    }
}

```

proxy-nw, wp-nw それぞれに所属しているので ok.

## nginx container

nginx は reverse proxy として利用.  
uri を見て container へ request を振り分けたい.

default.conf はこんな感じ.

```
server {
    listen       80;
    server_name  localhost;

    access_log /tmp/logs/nginx/host.access.log  main;
    error_log  /tmp/logs/nginx/error.log warn;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.php;
        proxy_pass http://apache/;
    }

    location ^~ /blog/ {
        index  index.html index.php;
        proxy_pass http://wp/;
    }

    location /phpmyadmin/ {
        proxy_pass http://pma/;
    }

    # redirect server error pages to the static page /50x.html
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

log は手元で確認したいから logs container の mount point を指定.  
`proxy_pass` で振り分ける uri を container 名で指定.

Dockerfile はこんな感じ.

```
FROM nginx

COPY ./default.conf /etc/nginx/conf.d/default.conf

# log 出力先 dir. 作成
RUN mkdir -p /tmp/logs/nginx

EXPOSE 80
```

image を build して container 起動. 外部からのアクセスを受け付けるために 80 番ポートを露出.

```
# build image & create container
$ docker build -t nginx-image ./nginx && \
  docker run \
    --name nginx \
    --net=proxy-nw \
    --volumes-from logs \
    -p 80:80 \
    -d \
    nginx-image


# 確認
$ docker ps -a

CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                   PORTS                 NAMES
95508353c7c2        nginx-image         "nginx -g 'daemon of…"   7 seconds ago       Up 5 seconds             0.0.0.0:80->80/tcp    nginx
40b2caf21fc4        wp-image            "docker-entrypoint.s…"   14 minutes ago      Up 13 minutes            80/tcp                wp
14aba9bb5e4f        pma-image           "/docker-entrypoint.…"   2 hours ago         Up 2 hours               80/tcp                pma
87299931672c        apache-image        "httpd-foreground"       2 hours ago         Up 2 hours               80/tcp                apache
0931e2d2ce19        mysql-image         "docker-entrypoint.s…"   4 hours ago         Up 4 hours               3306/tcp, 33060/tcp   mysql
42891337d93a        busybox             "sh"                     4 hours ago         Exited (0) 4 hours ago                         logs
```

これで proxy-nw に所属する container が出揃った.  
確認.

```
...
"Containers": {
    "14aba9bb5e4f98382e3ec9d1bf4d2d8cb38ee3afb217c5352015b42e1b8b659a": {
        "Name": "pma",
        "EndpointID": "e55a8136500bfcd2f91fc7bcabf429f153a21d4c09e05fb7f5aadd55e054dffa",
        "MacAddress": "02:42:ac:14:00:03",
        "IPv4Address": "172.20.0.3/16",
        "IPv6Address": ""
    },
    "40b2caf21fc4caaa40e8bf84598ee528167b7253adedf1f84330997e6b4dd9a1": {
        "Name": "wp",
        "EndpointID": "08572465e985df2107afdf15af118186746d0576397795c7edfcefd833465147",
        "MacAddress": "02:42:ac:14:00:04",
        "IPv4Address": "172.20.0.4/16",
        "IPv6Address": ""
    },
    "87299931672c13be3e7b671e241b8363c864db59884d2c7de97806b0dffec0d8": {
        "Name": "apache",
        "EndpointID": "e3d958f5ab36d8c73abc19ffae90005f43361c62cec4f0d17ace1998fe4bac02",
        "MacAddress": "02:42:ac:14:00:02",
        "IPv4Address": "172.20.0.2/16",
        "IPv6Address": ""
    },
    "95508353c7c2df217c34d83935cc71002fea1ba2d99c0ddd42174cbb179341bb": {
        "Name": "nginx",
        "EndpointID": "44047326cca6919ea262ae74740eaafb2e8a32bb4b223b86eae1ad281c06fc04",
        "MacAddress": "02:42:ac:14:00:05",
        "IPv4Address": "172.20.0.5/16",
        "IPv6Address": ""
    }
},
...
```

proxy-nw に pma, wp, apache, nginx の 4 container が所属している.

## 動作確認

最後に動作確認をしておしまい.

chrome から次の uri へアクセス.

- `localhost/`
    - `foo` と表示されれば ok
- `localhost/blog/`
    - wp inst. 画面が表示されれば ok
- `localhost/phpmyadmin/`
    - phpadmin UI が表示されれば ok
    - `wordpress` って名前の DB が出来上がっているはず

log も確認しておく.

```sh
$ tree ./logs/
./logs/
├── apache
│   └── access_log
└── nginx
    ├── error.log
    └── host.access.log
```

## まとめ

今回は練習を兼ねて Dockerfile & docker command でゴリゴリ構成した.  
お陰で各 container の役割や 同一 network 内 contaner 間通信について随分理解が深まった.

本記事で作成したファイル群は github で公開している. ご参考までに.

- [takimotok/smpl\_docker\_networks](https://github.com/takimotok/smpl_docker_networks)

ところで, 今回の作業は次の点が辛かった.

- log が期待通り出力されない場合のデバッグ
- wordpress をサブディレクトリで動かすための試行錯誤
- mysql container で日本語を使うまでの調整
- container 起動順序を常に意識すること
- image, container を何度も何度も破棄・生成するための長いコマンド入力

この規模なら docker-compose を使った方いい. これらを簡単に回避できるから.

[前回の記事](https://kengotakimoto.com/docker-data-volume/) から引き続き container を触る練習をしてきた.  
単体の container を触るところから始めて, いまでは network を作成して container 間通信を行うまでに至った.  
今後は自分が欲しい環境を docker-compose で構築してゆこう.

今回は以上.
