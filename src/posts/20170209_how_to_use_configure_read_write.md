---
title: '[cakePHP] Configure::read, write の使い方/ No variable $config found'
tags: ['CakePHP']
created_at: '2017-02-09'
---

google OAuth2.0 を利用する際に clientId, clientSecret を定数化して任意の場所から呼び出したかった.  
Configureの使い方を忘れてしまったのでメモ.

## 参考

- [クラスの設定\_CakePHP2.x Cookbook](https://book.cakephp.org/2.0/ja/development/configuration.html#id7)
- [Built-in Configuration readers | CakePHP2.x Cookbook](https://book.cakephp.org/2.0/en/development/configuration.html#built-in-configuration-readers)

## 動作環境

- CakePHP 2.8.5

### 前提条件

今回は google認証の利用を目的としているが, cakePHPの Configure 使用方法は使用するライブラリに依存しない.  
必要な箇所は適宜読み替えて欲しい.

google OAuth2.0 については[Google Identity Platform | 公式ドキュメント](https://developers.google.com/identity/protocols/OpenIDConnect#sendauthrequest)を参照.

## どんないいことがあるのか

`/app/Config/` に使用したい定数を定義しておけばプロジェクト内のどこからでも呼び出すことができる.

定数は一箇所で集中管理した方がディレクトリ構成がスッキリする.

このあたりについてはドキュメントに詳しく書いてある.

> CakePHP の Configure クラスは、アプリケーションや実行時固有の値を保存したり取り出したりするのに使います。  
> 注意していただきたいのですが、 このクラスは、その中にいかなるものでも格納することができ、 さらにあなたの コードのいかなる箇所でもそれらを使うことができてしまいます。
>
> -- [クラスの設定 | CakePHP2.x Cookbook](https://book.cakephp.org/2.0/ja/development/configuration.html#id7)

## 使い方

### 定義ファイル作成

`/app/Config/` に定義したいファイルを作成する.  
今回は `google.php` とする.

```php
// /app/Config/google.php

<?php

Configure::write('Google.clientId', 'クライアントID');
Configure::write('Google.clientSecret', 'クライアンシークレット');
```

それぞれの値は [API Managerの認証情報](https://console.developers.google.com)であらかじめ取得する必要がある.

### /app/Config/bootstrap.php に1行追加

先程作成したファイル名を引数に指定

```php
Configure::load("google");
```

### `Configure::read()` で呼び出し

先程の設定値を呼び出してみる.  
...しかし, 次の記述だとエラーが出る.

```sh
$ echo Configure::read('Google.clientId');
$ echo Configure::read('Google.clientSecret');
```

エラー内容

```
No variable $config found in /vagrant/app/Config/google.php
```

### No variable $config found in xxx

結論から書くと, `$config` が定義されるように記述しなければならない.  
私は次のように回避したが, cakePHP開発者の意図とは異なる解決方法かも.

```php
$config = array();
Configure::write('Google.clientId', 'クライアントID');
Configure::write('Google.clientSecret', 'クライアンシークレット');
```

#### `$config` を定義しなければならない理由

`$config` を定義してね. じゃないとエラー出すよ.  
とドキュメントに書いてある.

> class PhpReader Allows you to read configuration files that are stored as plain PHP files. You can read either files from your app/Config or from plugin configs directories by using plugin syntax. **Files must contain a $config variable.** An example configuration file would look like:
>
> ```
> $config = array(
>     'debug' => 0,
>     'Security' => array(
>         'salt' => 'its-secret'
>     ),
>     'Exception' => array(
>         'handler' => 'ErrorHandler::handleException',
>         'renderer' => 'ExceptionRenderer',
>         'log' => true
>     )
> );
> ```
>
> **Files without $config will cause an ConfigureException**
>
> -- [Built-in Configuration readers | CakePHP2.x Cookbook](https://book.cakephp.org/2.0/en/development/configuration.html#built-in-configuration-readers)

改めて呼び出すとちゃんと機能している.

```sh
$ echo Configure::read('Google.clientId'); #クライアントID
$ echo Configure::read('Google.clientSecret'); #クライアンシークレット
```

今回は以上.
