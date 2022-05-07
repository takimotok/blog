---
title: 'docker-compose + nginx + php-fpm で laravel 環境構築'
tags: ['laravel', 'docker', 'nginx', 'php-fpm']
created_at: '2020-07-31'
---

本記事の要点はこんな感じ.

- laravel 環境を docker-compose で構成
    - nginx, php-fpm, mysql
- nginx と php-fpm は unix ドメインソケット通信
    - data volume container を作って .sock を共有した
- ブラウザから http, 80 でアクセス
- nginx は reverse proxy
    - nginx で http request を受けて php container へ流す

今回残った課題はこのへん.

- ssl 化
- nginx のエラー解消

## 参考

次の記事に助けられました. ありがとうございます.

- [nginx と PHP-FPM の仕組みをちゃんと理解しながら PHP の実行環境を構築する](https://qiita.com/kotarella1110/items/634f6fafeb33ae0f51dc)
- [調べなきゃ寝れない！と調べたら余計に寝れなくなったソケットの話](https://qiita.com/kuni-nakaji/items/d11219e4ad7c74ece748)
- [docker-compose を使って（なるべく）公式イメージで PHP 開発環境を作った](https://qiita.com/hidekuro/items/46c00dec350c4a37fbb1#php)

## 動作環境

- mac mojave 10.14.6
- docker desktop for mac v2.2.0.5
- Docker version 19.03.8, build afacb8b
- docker-compose version 1.25.5, build 8a1c60f6

## 結論

こんな構成にした.

![](/images/pages/posts/20200731/01.png)

`http://dev.foo.com:80` のアクセスを一旦 nginx で受け, php container へ proxy する.  
このとき, hosts をこんな具合に書き換えておく.

```
# for docker-compose
127.0.0.1 dev.foo.com
```

図にはないけど, nginx の log は手元で確認したいから `./logs/nginx/` に access.log, error.log を出力した.

nginx ⇔ php-fpm の通信は container 名を指定しても可能だけど, 今回は unix ドメインソケットで行った.  
unix ドメインソケットでの通信は, 本来同一サーバ内での異なるプロセス間通信のために利用されるらしい.  
今回は data volume container として php-fpm-soket を立て, .sock を共有したけど, tcp に比べてどの程度パフォーマンスが向上したか不明.  
(tcp と両方試したけど体感速度に変化はなかった)

他に気を付けたのはこのへん.

- mysql で日本語表示を可能に
- contaner に潜るときに辛くなるから vim 入れた

今回の構成で改善したい点はこれ.

- ssl 化
- nginx のエラー解消

結論は以上.

ここから解説.

## dir. 構成

dir. 構成はこんな感じ.

```
.
├── .env
├── db
│   ├── Dockerfile
│   └── mysql
│       ├── conf.d
│       │   └── my.cnf
│       └── data
├── docker-compose.yml
├── logs
│   └── nginx
├── nginx
│   ├── conf.d
│   │   └── default.conf
│   └── nginx.conf
├── php
│   ├── Dockerfile
│   ├── php-fpm.d
│   │   └── zzz-www.conf
│   └── php.ini
└── src
```

- .env
    - docker-compose.yml 内で利用する環境変数をまとめておくファイル
- db
    - mysql container に関係するファイル郡
    - `db/mysql/data` はデータ永続化のためにコンテナへマウント
- docker-compose.yml
    - 全体的な構成管理を定義
- logs
    - 今回は nginx の log 出力先として利用
- nginx
    - proxy として利用する設定ファイル郡
- php
    - laravel に関係するファイル群
    - nginx ⇔ php-fpm 間を unix ドメインソケットで通信するために .conf を用意
    - ファイル名注意
- src
    - git 管理している laravel プロジェクト

## docker-compose.yml

docker-compose.yml はこんな感じ.

```
version: '3'
volumes:
  php-fpm-socket:
services:
  nginx:
    image: nginx
    container_name: nginx
    ports:
      - 80:80
    volumes:
      - ${SRC}:/var/www
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf
      - php-fpm-socket:/var/run/php-fpm
    restart: always
    depends_on:
      - php
  php:
    build: ./php
    container_name: php
    volumes:
      - ./php/php-fpm.d/zzz-www.conf:/usr/local/etc/php-fpm.d/zzz-www.conf
      - ${SRC}:/var/www
      - php-fpm-socket:/var/run/php-fpm
    depends_on:
      - db
  db:
    build: ./db
    restart: always
    container_name: db
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      TZ: 'Asia/Tokyo'
    volumes:
      - ./db/mysql/data:/var/lib/mysql
      - ./db/mysql/conf.d/my.cnf:/etc/mysql/conf.d/my.cnf
    ports:
      - 3306:3306
```

簡単に解説.

- `${変数名}` は `.env` ファイルで定義した値が代入される
- php-fpm-socket
    - nginx ⇔ php-fpm を unix ドメインソケット通信させるために data volume container として定義
    - unix ドメインソケットについてはここが詳しい ↓
    - [調べなきゃ寝れない！と調べたら余計に寝れなくなったソケットの話](https://qiita.com/kuni-nakaji/items/d11219e4ad7c74ece748)
- `services`
    - 今回は次の 3 container を用意
    - nginx
        - リクエストを php container へ proxy する
    - php
        - laravel 用の container として
        - `artisan`, `npm` コマンドはこの中で打つ
    - db
        - ご存知 mysql
- nginx
    - `nginx.conf`
        - php-fpm と unix ドメインソケット通信するために実行ユーザを `www-data` にするためだけに用意
    - `php-fpm-socket:/var/run/php-fpm`
        - data volume container として `php-fpm-socket` を定義して, `default.conf` 内で .sock の path を指定
- php
    - `./php/php-fpm.d/zzz-www.conf:/usr/local/etc/php-fpm.d/zzz-www.conf`
        - php-fpm の設定項目をマウント
        - cf.) [php-fpm.conf のグローバル設定項目](https://www.php.net/manual/ja/install.fpm.configuration.php)
    - `php-fpm-socket:/var/run/php-fpm`
        - nginx と unix ドメインソケット通信するために .sock を共有
- db
    - `./db/mysql/data:/var/lib/mysql`
        - mysql データを永続化したいのでマウント
    - `./db/mysql/conf.d/my.cnf:/etc/mysql/conf.d/my.cnf`
        - 文字コード定義
        - sql コマンド打つときに日本語使えないと辛いから `my.cnf` で設定

## .env

docker-compose.yml で利用する かつ プロジェクト毎に書き換えが必要そうなもの を環境変数として `.env` 定義.  
こんな感じ.

```
# laravel src
SRC=./src # git 管理している src への path or シンボリックリンクを貼る path

# db
DB_DATABASE=fooooo # laravel の .env と合わせる
DB_ROOT_PASSWORD=barrrr # laravel の .env と合わせる
```

解説は ↑ のコメントの通り.

`SRC` はシンボリックリンクを貼ってもいいし, git clone してもいい.

## nginx

nginx container で用意するファイルはこれ.

- nginx.conf
- default.conf

一つずつ見てゆく.

### nginx.conf

nginx.conf はこんな感じ.  
php-fpm との unix ドメインソケット通信のために初期状態から実行ユーザのみ変更.

```
# user  nginx;
user  www-data; # <- デフォルトからココだけ変更
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

`www-data` は apache のデフォルト実行ユーザ.  
今回は apache を使わないけど慣習として指定.

php container で定義されているユーザを確認してみるといいかも.  
こんな感じ.

```
$ docker-compose exec php /bin/bash -c "cat /etc/passwd | grep -i 'www-data'"
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

nginx ではなく, php-fpm 側の初期設定は次のファイルを見ると分かる.  
こんな感じ.

```
$ docker-compose exec php /bin/bash -c "cat /usr/local/etc/php-fpm.d/www.conf"

# 出力結果は省略
```

### default.conf

次に `nginx/conf.d/default.conf` はこんな感じ.

```
server {
  listen 80;
  server_name dev.foo.com;

  index index.php index.html;
  root /var/www/public;

  access_log /var/log/nginx/access.log;
  error_log  /var/log/nginx/error.log;

  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  location ~ \.php$ {
    fastcgi_split_path_info ^(.+\.php)(/.+)$;
    # tcp で接続する場合はこっち ↓
    # `php` は container 名であることに注意
        # fastcgi_pass php:9000;
    # unix ドメインソケットで接続する場合はこっち ↓
    fastcgi_pass unix:/var/run/php-fpm/php-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param PATH_INFO $fastcgi_path_info;
  }
}
```

`php-fpm.sock` 置き場は data volume container として php container と共有.  
設定が上手くいくと `/var/run/php-fpm/` に `php-fpm.sock` が作られて通信が成立する.

## php

php container 起動に必要なファイルはこれ.

- Dockerfile
- php-fpm.d/zzz-www.conf
- php.ini

### Dockerfile

Dockerfile はこんな感じ

```
FROM php:7.4-fpm

RUN apt-get update \
  && apt-get install -y zlib1g-dev libzip-dev zip mariadb-client-10.3 libpng-dev libjpeg-dev curl wget \
  && docker-php-ext-install zip pdo_mysql

# nodejs install
RUN apt-get install -y nodejs npm && \
  npm install n -g && \
  n 8.11.3 && \
  apt-get purge -y nodejs npm

# Composer install
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php -r "if (hash_file('SHA384', 'composer-setup.php') === '$(wget -q -O - https://composer.github.io/installer.sig)') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" \
  && php composer-setup.php \
  && php -r "unlink('composer-setup.php');" \
  && mv composer.phar /usr/local/bin/composer

# composer env.
ENV COMPOSER_ALLOW_SUPERUSER 1 \
  COMPOSER_HOME /composer \
  PATH $PATH:/composer/vendor/bin

WORKDIR /var/www

COPY ./php-fpm.d/zzz-www.conf /usr/local/etc/php-fpm.d/zzz-www.conf
COPY php.ini /usr/local/etc/php/

RUN composer global require "laravel/installer"
```

node.js はコミット先プロジェクトの関係で `8.11.3` を指定.  
`zzz-www.conf` は nginx との unix ドメインソケット通信で必要.

### php-fpm.d/zzz-www.conf

ファイル名注意.  
迂闊なファイル名にすると .sock ができずにハマる.

> fpm の設定ファイルを zzz-www.conf としていますが、これは 公式イメージが zz-docker.conf で listen 設定をぶっ潰しているのに対抗するためです。  
> 後に読まれたものが勝つので。
>
> -- [docker-compose を使って（なるべく）公式イメージで PHP 開発環境を作った](https://qiita.com/hidekuro/items/46c00dec350c4a37fbb1#php)

上記のサイトを参考に, 辞書順で後ろに来るように `zzz-www.conf` というファイル名にした.  
実行ユーザは `www-data` に統一.

```
[www]
listen = /var/run/php-fpm/php-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0666
```

php container では `www-data` がユーザとして存在している.  
もし `nginx` ユーザとして `listen.owner`, `listen.group` を指定すると ↓ こんな感じ で存在しないユーザとしてエラーが出るので注意.

```
$ docker-compose logs php

Attaching to php
php      | [30-Jul-2020 08:11:38] ERROR: [pool www] cannot get uid for user 'nginx': Success (0)
php      | [30-Jul-2020 08:11:38] ERROR: [pool www] cannot get uid for user 'nginx': Success (0)
php      | [30-Jul-2020 08:11:38] ERROR: FPM initialization failed
php      | [30-Jul-2020 08:11:38] ERROR: FPM initialization failed
```

### php.ini

php.ini はこんな感じ

```
zend.exception_ignore_args = off
expose_php = on
max_execution_time = 30
max_input_vars = 1000
upload_max_filesize = 64M
post_max_size = 128M
memory_limit = 256M
error_reporting = E_ALL
display_errors = on
display_startup_errors = on
log_errors = on
error_log = /dev/stderr
default_charset = UTF-8

[Date]
date.timezone = "Asia/Tokyo"

[mbstring]
mbstring.internal_encoding = "UTF-8"
mbstring.language = "Japanese"

[mysqlnd]
mysqlnd.collect_memory_statistics = on

[Assertion]
zend.assertions = 1
```

upload 可能なファイルサイズやメモリはテキトー.  
状況に合わせて随時変更する予定.

## db

今回は DB として mysql を利用する.  
DB 設定に必要なファイルはこの辺.

- Dockerfile
- my.cnf

ちょっと解説.

### Dockerfile

Dockerfile の中身はこんな感じ.

```
FROM mysql:5.7

# 日本語化
RUN apt-get update && apt-get -y upgrade \
  && apt-get -y install locales locales-all \
  && echo 'export LANG=ja_JP.UTF-8' >> ~/.bashrc \
  && echo 'export LANGUAGE="ja_JP:ja"' >> ~/.bashrc \
  # vim が欲しい
  && apt-get -y install vim
```

環境変数設定やマウントは docker-compose.yml で行っているので, Dockerfile では日本語化くらいしかしていない.  
ディレクトリ潜るときに vim がないと辛いので入れたけど, この辺はお好みで.

### my.cnf

`my.cnf` は mysql の設定ファイル.  
local では `./db > mysql > conf.d > my.cnf` に置いている.

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

ここでは mysql server, client で文字コードを統一している.

## ざっと動かす

ここまでできたら `$ docker-compose up -d` で定義した container を起動.

```
$ docker-compose up -d && \
  docker-compose ps -a

Creating network "ディレクトリ名_default" with the default driver
Creating db ... done
Creating php ... done
Creating nginx ... done

Name               Command               State                 Ports
----------------------------------------------------------------------------------
db      docker-entrypoint.sh mysqld      Up      0.0.0.0:3306->3306/tcp, 33060/tcp
nginx   /docker-entrypoint.sh ngin ...   Up      0.0.0.0:80->80/tcp
php     docker-php-entrypoint php-fpm    Up      9000/tcp
```

今回は laravel プロジェクトを git 管理していたから新規プロジェクト作成作業はナシ.  
一方で, DB には必要なデータが入っていないから DB 作成, migration, seeding は必要.

ブラウザから `localhost` でもアクセス可能なんだけど, 今回は `dev.foo.com` でアクセスしたい.  
mac の hosts ファイルを書き換えてアクセスした.  
こんな感じ.

```
# nginx の server_name で定義した host と同じものを定義
127.0.0.1 dev.foo.com
```

ブラウザから `dev.foo.com` へアクセスして nginx の access.log が吐かれているか確認.  
こんな感じ.

```
$ tail -F logs/nginx/access.log
```

## まとめ

今回は docker-compose で laravel 環境を構築した.

data volume container を経由して nginx ⇔ php-fpm 間通信を unix ドメインソケットにしたけど,  
単純に tcp (コンテナ名指定) 通信する場合と速度比較してないのでパフォーマンスの違いは不明.

今回未着手の課題は次の2つ.

- ssl 化
- nginx のエラー解消

いま発生している nginx のエラーはこれ.

```
$ docker-compose logs nginx | grep -i "error"

nginx    | 10-listen-on-ipv6-by-default.sh: error: /etc/nginx/conf.d/default.conf differs from the packaged version
```

近々解消したい.

今回は以上.
