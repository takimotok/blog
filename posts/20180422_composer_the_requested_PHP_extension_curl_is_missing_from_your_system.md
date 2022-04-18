---
title: 'composerで怒られた. the requested PHP extension curl is missing from your system'
tags: ['composer', 'laravel', 'php']
created_at: '2018-04-22'
---

facebook/webdriver の inst. 中に怒られたので原因調査.  
概要は次の通り.

## 動作環境

- windows10 x64 Home
- PHP 7.1.10
- chocolatey 0.10.8
- Gow 0.8.0

私はwindows上でlinux系コマンドを使いたいのでGow(Gnu on Windows)を利用している.  
windows または mac どちらかしか使ったことない人はコマンドや `$`, `>` 等を適宜読み替えて頂きたい.

## 作業ログ

`facebook/webdriver` inst. 中に怒られた.

```
> composer require facebook/webdriver

Using version ^1.5 for facebook/webdriver
./composer.json has been created
Loading composer repositories with package information
Updating dependencies (including require-dev)
Your requirements could not be resolved to an installable set of packages.

  Problem 1
    - Installation request for facebook/webdriver ^1.5 -> satisfiable by facebook/webdriver[1.5.0].
    - facebook/webdriver 1.5.0 requires ext-curl * -> the requested PHP extension curl is missing from your system.

  To enable extensions, verify that they are enabled in your .ini files:
    - C:\tools\php71\php.ini
  You can also run `php --ini` inside terminal to see which files are used by PHP in CLI mode.

Installation failed, deleting ./composer.json.
```

どうやら cURLの拡張を利用するには php.ini の設定が必要っぽい.  
参照している php.ini のパスを確認する.

```
$ php -i | grep -i php.ini

Configuration File (php.ini) Path => C:\WINDOWS
Loaded Configuration File => C:\tools\php71\php.ini
```

`C:\tools\php71\php.ini` 内のcurl extensionのコメントアウトを外す.

```
# C:\tools\php71\php.ini

# 中略

; Windows Extensions
; Note that ODBC support is built in, so no dll is needed for it.
; Note that many DLL files are located in the extensions/ (PHP 4) ext/ (PHP 5+)
; extension folders as well as the separate PECL DLL download (PHP 5+).
; Be sure to appropriately set the extension_dir directive.
;
;extension=php_bz2.dll
extension=php_curl.dll # <- ここのコメントを外す
;extension=php_fileinfo.dll
;extension=php_ftp.dll
;extension=php_gd2.dll
;extension=php_gettext.dll

# 中略
```

確認

```
$ php -i | grep -i curl

curl
cURL support => enabled
cURL Information => 7.55.0
```

ok.

再度実行.

```
$ composer require facebook/webdriver

Using version ^1.5 for facebook/webdriver
./composer.json has been created
Loading composer repositories with package information
Updating dependencies (including require-dev)
Package operations: 2 installs, 0 updates, 0 removals
  - Installing symfony/process (v4.0.8): Downloading (100%)
  - Installing facebook/webdriver (1.5.0): Downloading (100%)
Writing lock file
Generating autoload files
```

ok.  
今回は以上.
