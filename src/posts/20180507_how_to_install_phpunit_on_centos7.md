---
title: 'centos7 に phpunit をインストールする方法'
tags: ['phpunit', 'centos']
created_at: '2018-05-07'
---

phpunitを使うための準備を行う.

## 動作環境

- centos 7
- composer 1.6.4
- php 7.1.x
- phpunit 7.1.4

### 前提条件

- centos7 は既に入手済みとする
- 各種リポジトリはインストール済みとする
- php5.6.x が入っていたので, これを一旦削除して作業を行った関係でパッケージ依存問題をスキップした

## composer 1.6.4 インストール

composer 1.6.4 を centos7 にインストールする.

```sh
#
# composer inst.
# -sS : エラーが発生した場合は表示
$ curl -sS https://getcomposer.org/installer | php

#
# $ composer コマンドが使えるようにパスを通す
#

# 確認
$ env | grep -i path
PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/vagrant/.local/bin:/home/vagrant/bin

# パスを通す
$ sudo mv composer.phar /usr/local/bin/composer

#
# update composer
#
$ composer self-update
You are already using composer version 1.6.4 (stable channel).
```

以上で composer インストール が完了.

## php 7.1.x インストール

続いて php7.1.x を centos7 にインストールする.  
既に入っていた php5.6.x を削除し, php7.1.x を入れ直したので  
パッケージ依存関係のエラーが出たが, skipした.

```sh
#
# inst. 済みのリポジトリ かつ php7.x が有効なもの の一覧を取得
#
$ yum repolist all | grep -i php7
Repodata is over 2 weeks old. Install yum-cron? Or run: yum makecache fast
remi-php70                         Remi's PHP 7.0 RPM repository disabled
remi-php70-debuginfo/x86_64        Remi's PHP 7.0 RPM repository disabled
remi-php70-test                    Remi's PHP 7.0 test RPM repos disabled
remi-php70-test-debuginfo/x86_64   Remi's PHP 7.0 test RPM repos disabled
remi-php71                         Remi's PHP 7.1 RPM repository disabled
remi-php71-debuginfo/x86_64        Remi's PHP 7.1 RPM repository disabled
remi-php71-test                    Remi's PHP 7.1 test RPM repos disabled
remi-php71-test-debuginfo/x86_64   Remi's PHP 7.1 test RPM repos disabled
remi-php72                         Remi's PHP 7.2 RPM repository disabled
remi-php72-debuginfo/x86_64        Remi's PHP 7.2 RPM repository disabled
remi-php72-test                    Remi's PHP 7.2 test RPM repos disabled
remi-php72-test-debuginfo/x86_64   Remi's PHP 7.2 test RPM repos disabled

#
# php7.x を inst.
# --skip-broken でphp5.6.x系の依存問題をスキップ
$ sudo yum install -y --enablerepo=remi-php71 --skip-broken php php-cli php-common php-mbstring php-mcrypt php-msqlnd php-opcache php-pdo php-pear php-pecl-jsonc php-pecl php-process php-soap php-xml php-xmlrpc

Installed:
  php.x86_64 0:7.1.17-1.el7.remi                php-cli.x86_64 0:7.1.17-1.el7.remi          php-common.x86_64 0:7.1.17-1.el7.remi
  php-mbstring.x86_64 0:7.1.17-1.el7.remi       php-mcrypt.x86_64 0:7.1.17-1.el7.remi       php-opcache.x86_64 0:7.1.17-1.el7.remi
  php-pdo.x86_64 0:7.1.17-1.el7.remi            php-pear.noarch 1:1.10.5-6.el7.remi         php-process.x86_64 0:7.1.17-1.el7.remi
  php-soap.x86_64 0:7.1.17-1.el7.remi           php-xml.x86_64 0:7.1.17-1.el7.remi          php-xmlrpc.x86_64 0:7.1.17-1.el7.remi

Dependency Installed:
  php-fedora-autoloader.noarch 0:1.0.0-1.el7                             php-json.x86_64 0:7.1.17-1.el7.remi

Skipped (dependency problems):
  php56u-pecl-jsonc.x86_64 0:1.3.10-2.ius.centos7

Complete!


#
# 確認
#
$ php -v
PHP 7.1.17 (cli) (built: Apr 25 2018 08:30:10) ( NTS )
Copyright (c) 1997-2018 The PHP Group
Zend Engine v3.1.0, Copyright (c) 1998-2018 Zend Technologies
    with Zend OPcache v7.1.17, Copyright (c) 1999-2018, by Zend Technologies

#
# php.ini の場所を確認
#
$ php -i | grep -i php.ini
Configuration File (php.ini) Path => /etc
Loaded Configuration File => /etc/php.ini
```

以上で php7.1.x インストールは完了.

## phpunit 7.1.4 インストール

`compsoer` コマンドを利用して phpunit をインストールする.

packagistによると最新の安定版は 7.1.4 らしい.

- [phpunit/phpunit | packagist](https://packagist.org/packages/phpunit/phpunit)

後々git管理することを考え, `composer.json` を勝手に作ってくれる `$ composer require` コマンドで phpunit をインストールする.

以下, ハマったエラーも紹介するが, それらを事前に回避するために次のコマンドを打っておくと良い.

`$ sudo yum -y install zip unzip`

以下, phpunit インストール手順.

```sh
#
# phpunit inst.
#
$ composer require phpunit/phpunit:7.1.4

./composer.json has been created
Loading composer repositories with package information
Updating dependencies (including require-dev)
Package operations: 28 installs, 0 updates, 0 removals
    Failed to download sebastian/version from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/version (2.0.1): Cloning 99732be0dd
    Failed to download sebastian/resource-operations from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/resource-operations (1.0.0): Cloning ce990bb217
    Failed to download sebastian/recursion-context from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/recursion-context (3.0.0): Cloning 5b0cd72350
    Failed to download sebastian/object-reflector from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/object-reflector (1.1.1): Cloning 773f97c67f
    Failed to download sebastian/object-enumerator from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/object-enumerator (3.0.3): Cloning 7cfd9e65d1
    Failed to download sebastian/global-state from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/global-state (2.0.0): Cloning e8ba02eed7
    Failed to download sebastian/exporter from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/exporter (3.1.0): Cloning 234199f452
    Failed to download sebastian/environment from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/environment (3.1.0): Cloning cd0871b397
    Failed to download sebastian/diff from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/diff (3.0.0): Cloning e09160918c
    Failed to download sebastian/comparator from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/comparator (3.0.0): Cloning ed5fd22811
    Failed to download doctrine/instantiator from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing doctrine/instantiator (1.1.0): Cloning 185b8868aa
    Failed to download phpunit/php-text-template from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/php-text-template (1.2.1): Cloning 31f8b717e5
    Failed to download phpunit/phpunit-mock-objects from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/phpunit-mock-objects (6.1.1): Cloning 70c740bde8
    Failed to download phpunit/php-timer from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/php-timer (2.0.0): Cloning 8b8454ea69
    Failed to download phpunit/php-file-iterator from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/php-file-iterator (1.4.5): Cloning 730b01bc3e
    Failed to download theseer/tokenizer from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing theseer/tokenizer (1.1.0): Cloning cb2f008f3f
    Failed to download sebastian/code-unit-reverse-lookup from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing sebastian/code-unit-reverse-lookup (1.0.1): Cloning 4419fcdb5e
    Failed to download phpunit/php-token-stream from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/php-token-stream (3.0.0): Cloning 21ad88bbba
    Failed to download phpunit/php-code-coverage from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/php-code-coverage (6.0.3): Cloning 774a82c0c5
    Failed to download webmozart/assert from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing webmozart/assert (1.3.0): Cloning 0df1908962
    Failed to download phpdocumentor/reflection-common from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpdocumentor/reflection-common (1.0.1): Cloning 21bdeb5f65
    Failed to download phpdocumentor/type-resolver from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpdocumentor/type-resolver (0.4.0): Cloning 9c97770899
    Failed to download phpdocumentor/reflection-docblock from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpdocumentor/reflection-docblock (4.3.0): Cloning 94fd000123
    Failed to download phpspec/prophecy from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpspec/prophecy (1.7.6): Cloning 33a7e3c4fd
    Failed to download phar-io/version from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phar-io/version (1.0.1): Cloning a70c0ced4b
    Failed to download phar-io/manifest from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phar-io/manifest (1.0.1): Cloning 2df402786a
    Failed to download myclabs/deep-copy from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing myclabs/deep-copy (1.7.0): Cloning 3b8a3a99ba
    Failed to download phpunit/phpunit from dist: The zip extension and unzip command are both missing, skipping.
Your command-line PHP is using multiple ini files. Run `php --ini` to show them.
    Now trying to download from source
  - Installing phpunit/phpunit (7.1.4): Cloning 6d51299e30
sebastian/global-state suggests installing ext-uopz (*)
phpunit/php-code-coverage suggests installing ext-xdebug (^2.6.0)
phpunit/phpunit suggests installing phpunit/php-invoker (^2.0)
phpunit/phpunit suggests installing ext-xdebug (*)
Writing lock file
Generating autoload files
```

めっちゃ怒られてる.  
zip と unzip を入れてみる.

```sh
$ sudo yum -y install zip unzip
```

リトライ.

```sh
# phpunit inst.
$ composer require phpunit/phpunit:7.1.4

./composer.json has been updated
Loading composer repositories with package information
Updating dependencies (including require-dev)
Nothing to install or update
Generating autoload files
```

何も変わってないようにみえるけど...いけたか?  
一応確認.

```sh
$ vendor/bin/phpunit --version

PHPUnit 7.1.4 by Sebastian Bergmann and contributors.
```

多分ok.

phpUnit install. は以上.

次に `$ phpunit` コマンドを使えるようにpathを通す.

```sh
#
# シンボリックリンクを貼る
#
$ sudo ln -s ./vendor/bin/phpunit /usr/local/bin/phpunit

#
# 確認
#
$ phpunit --version
PHPUnit 7.1.4 by Sebastian Bergmann and contributors.
```

↑今回はこうやってpathを追加したけど, こうやってもよかったかも↓

```sh
#
# path確認
#
$ env | grep -i path
PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/vagrant/.local/bin:/home/vagrant/bin

#
# 環境変数である $PATH を確認
#
$ echo $PATH
/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/vagrant/.local/bin:/home/vagrant/bin

#
# パスは `:` 区切りであることに気をつけて path追加
#
export PATH="/vagrant/vendor/bin:$PATH"
```

ok.

今回は以上.
