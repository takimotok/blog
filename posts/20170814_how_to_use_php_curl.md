---
title: 'php curlの基本的な使い方'
tags: ['php']
created_at: '2017-08-14'
---

なんとなく使ってきたcurlをしっかり理解しようと思ったのでまとめる.

コマンドラインからも実行可能だが, 今回はPHPで利用する場合を想定.

## 参考

- [curl_setopt | php.net](http://php.net/manual/ja/function.curl-setopt.php)

基本的には curl に関する項目を↑この公式HPで確認する方針で.

## 動作環境

- PHP 5.6

## 前提条件

curlをはじめて使うときに悩むのがオプションの多さ.  
今回は必要最低限のオプションと, その基本的な使い方に絞って解説.

## 基本的な使い方

ここではcurlの手順を簡単に紹介する.  
必要に応じてオプションの紹介も行う.

概要は次の通り.

1. 大まかな手順
2. よく使うオプション

### 大まかな手順

手順自体はとってもシンプル.

1. `curl_init()`
    - セッション初期化
    - これから curlはじめるよっ って宣言
2. `curl_setopt()`
    - オプション設定
    - 私は配列にまとめることが多い
    - もし配列でまとめるなら `curl_setopt_array()` を使う
    - curlの設定はたいていの場合1つじゃ済まないから↑こっちがおススメ
3. `curl_exec()`
    - 転送実行
    - 目的のurlにリクエストを投げるってこと
4. `curl_close()`
    - セッション終了
    - これで curlおしまい って宣言

いわゆるセッションと同じ考え方で, 開始・終了をそれぞれ宣言する必要がある.

ここで紹介したコマンドの使い方をポイントを絞って一つずつ見てゆく.

#### `curl_init()`

このコマンドでセッションの初期化を行う.  
返り値は cURLハンドル.  
cURLハンドルは次のコマンドで再利用する.

- `curl_setopt()`
- `curl_exec()`
- `curl_close()`

気を付けるポイントは次の通り.

- 次の記述はどちらも同じ意味だということ

```php
$ch = curl_init($url);
```

```php
$ch = curl_init();
$url = "http://www.example.com/";
curl_setopt($ch, CURLOPT_URL, $url);
```

ターゲットurlを `curl_init()` の引数として指定可能.  
もし引数として指定しない場合は `CURLOPT_URL` としてオプション指定する必要がある.

これは公式HPにも書いてある.

> urlを指定した場合、オプション CURLOPT\_URL がそのパラメータの値に設定されます。 関数 curl\_setopt() により、 この値をマニュアルで設定することも可能です。
>
> -- [curl\_init | php.net](http://php.net/manual/ja/function.curl-init.php)

#### `curl_setopt()`, `curl_setopt_array()`

curlのオプションを設定する関数.

`curl_setopt()` は↑上の `curl_init()` で紹介した通りの使い方.

ここでは `curl_setopt_array()` の使い方を紹介.  
サンプルコードは次の通り.

```php
$curl = curl_init($url);
$method = 'GET';
$options = [
  CURLOPT_CUSTOMREQUEST => $method,
  CURLOPT_RETURNTRANSFER => true
];

curl_setopt_array($curl, $options);// ここでオプションをまとめて適用
$response = curl_exec($curl);
curl_close ($curl);
```

オプションの中身はさておき, こんな具合にオプションはまとめて適用可能だということ.

curlを使うときはオプション指定が1つで済むことはない.  
何度も `curl_setopt()` を記述するよりも, 必要なオプションを配列にまとめた方が可読性が高いと思う.

#### `curl_exec()`

このコマンドで目的のurlに転送を実行する.  
引数には `curl_init($url);` で宣言したcurlハンドルを指定する.

サンプルコードを再掲するので, `curl_excec()` のあたりを確認してほしい.

```php
$curl = curl_init($url);
$method = 'GET';
$options = [
  CURLOPT_CUSTOMREQUEST => $method,
  CURLOPT_RETURNTRANSFER => true
];

curl_setopt_array($curl, $options);// ここでオプションをまとめて適用
$response = curl_exec($curl);
curl_close ($curl);
```

#### `curl_close()`

セッション終了を宣言する関数.  
ここでも引数にcurlハンドルを指定する.

コマンドについては以上.

### よく使うオプション

`curl_setopt()` や `curl_setopt_array()` で設定するオプションについて.  
よく使うものを紹介する.

詳しく知りたい場合は公式HPを参照.

- [curl\_setopt | php.net](http://php.net/manual/ja/function.curl-setopt.php)

| オプション | 意味 |
| :-- | :-- |
| CURLOPT\_URL | 取得するurl |
| CURLOPT\_CUSTOMREQUEST | httpリクエストメソッドを指定 |
| CURLOPT\_RETURNTRANSFER | `curl_exec()` の返り値を 文字列で返す |
| CURLOPT\_HEADER | ヘッダの内容も出力 |
| CURLOPT\_TIMEOUT | cURL 関数の実行にかけられる時間の最大値 |
| CURLOPT\_CONNECTTIMEOUT | 接続の試行を待ち続ける秒数 |

## 実際に使ってみる

以前[こちらの記事](https://kengotakimoto.com/post-717/)で紹介したときには `file_get_contents()` を利用して当ブログをスクレイピングした.

PHPでcurlを利用するシーンとしてはAPIを叩いてjsonデータ取得するのが一般的だけど...  
今回はサンプルとして当ブログのトップページをstringsとして取得してみる.

サンプルは次の通り.

```php
// request w/ curl
$url = 'https://kengotakimoto.com/';
$ch  = curl_init($url);
$method = 'GET';
$options = [
  CURLOPT_CUSTOMREQUEST => $method,
  CURLOPT_RETURNTRANSFER => true // fetch datum as strings
];
curl_setopt_array($ch, $options);
$response = curl_exec($ch);
curl_close ($ch);

// display result
echo "<pre>";
var_dump($response);
echo "</pre>";exit;
```

実行結果

```html
<!DOCTYPE html>
<html lang="ja"
  itemscope
  itemtype="http://schema.org/WebSite"
  prefix="og: http://ogp.me/ns#" >
<head>
<meta name="google-site-verification" content="pjsS6IaoUExPa6dmEgKlb3qv9KVdk_xiiGeWXKrPyg0" />
<meta charset="UTF-8">
<meta name="viewport" content="width=1280, maximum-scale=1, user-scalable=yes">
<link rel="alternate" type="application/rss+xml" title="たきもと.com RSS Feed" href="https://kengotakimoto.com/feed/" />
<link rel="pingback" href="https://kengotakimoto.com/xmlrp... (length=61064)
```

今回は以上.
