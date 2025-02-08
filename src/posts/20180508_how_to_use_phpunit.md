---
title: 'phpunit 基本的な使い方'
tags: ['php']
created_at: '2018-05-08'
updated_at: ''
---

簡単なサンプルを作りながらphpunitの基本的な使い方を学ぶ.

## PHPUnit を使ってできること

PHPUnitを使うと, 自分が作ったメソッドが期待通りの値を返すかどうかを機械的にチェックできる.  
期待値はこちらで用意する必要がある.

## ディレクトリ構成

基本的には次の2ディレクトリにphpファイルを作りながら動作を確認してゆく.

- app
  - メイン処理を行うファイルを格納するディレクトリ
- tests
  - テスト用ファイルを格納するディレクトリ

## テスト用ファイル 書き方

どうやらクラス名命名規則等にルールがあるらしい.  
公式ドキュメントの↓このページが参考になる.

- [2\. PHPUnit 用のテストの書き方 | PHPUnit](http://phpunit.readthedocs.io/ja/latest/writing-tests-for-phpunit.html)

このドキュメントにはクラス名命名規則や継承するクラスについて書かれている.  
書き方をざっくりまとめる.

ここでは次のファイルを例に考える.

- app
  - message.php
    - `getMessage()` をメソッドとして持つ
- tests
  - messageTest.php

PHPUnitの書き方のルールは次の通り.

1. クラス名
    - `Message` という名前のクラスをテストしたいときは, テスト用ファイルのクラス名を `messageTest` とする.
2. 継承しなきゃいけないクラス
    - `PHPUnit\Framework\TestCase`
        - c.f.) `use PHPUnit\Framework\TestCase;`
3. メソッド名
    - `test*` という名前のパブリックメソッド
        - c.f.) `public function testMessage() { xxx }`
4. PHPUnitで用意されているテストメソッド
    - テストメソッドを利用して, 期待値と実際の値が等しいことをチェック
    - c.f.) `assertEquals()`

## とりあえず動かしてみる

とりあえず動かしてみる.  
作成するファイルは次の通り.

- app
  - message.php
- tests
  - messageTest.php

```php
# app/message.php

class Message
{
    private $message;

    public function __construct(string $message)
    {
        $this->message = $message;
    }

    public function getMessage()
    {
        return $this->message;
    }
}
```

```php
# tests/messageTest.php

require_once (dirname(__FILE__). '/../vendor/autoload.php');
require_once (dirname(__FILE__). '/../app/message.php');

use PHPUnit\Framework\TestCase;

class MessageTest extends TestCase
{
    public function testGetMessage()
    {
        $message = new Message('hello world');
        $this->assertEquals('hello world', $message->getMessage());
    }
}
```

テストを実行してみる.

```php
$ phpunit tests/messageTest.php
PHPUnit 7.1.4 by Sebastian Bergmann and contributors.

.  1 / 1 (100%)

Time: 103 ms, Memory: 4.00MB

OK (1 test, 1 assertion)
```

これでテストが通ったことになる.

ちょっと失敗させてみる.  
次のファイルを変更.

```php
# /tests/messageTest.php

<?php

require_once (dirname(__FILE__). '/../vendor/autoload.php');
require_once (dirname(__FILE__). '/../app/message.php');

use PHPUnit\Framework\TestCase;

class MessageTest extends TestCase
{
    public function testGetMessage()
    {
        $message = new Message('hello world');
        // $this->assertEquals('hello world', $message->getMessage());
        $this->assertEquals('nice to meet you', $message->getMessage()); # (期待値, 実行して得られた値)
    }
}
```

いまさらだが, `assertEquals()` の使い方は公式ページを参照↓

- [assertEquals() | phpunit/ja](http://phpunit.readthedocs.io/ja/latest/assertions.html#assertequals)

テスト実行.

```sh
$ phpunit tests/messageTest.php
PHPUnit 7.1.4 by Sebastian Bergmann and contributors.

F  1 / 1 (100%)

Time: 121 ms, Memory: 4.00MB

There was 1 failure:

1) MessageTest::testGetMessage
Failed asserting that two strings are equal.
--- Expected
+++ Actual
@@ @@
-'nice to meet you' # 期待値. 今回は期待値がミスってた
+'hello world' # 実際の値

/vagrant/tests/messageTest.php:14 # 該当箇所

FAILURES!
Tests: 1, Assertions: 1, Failures: 1.
```

うん.  
ちゃんと失敗してるね.  
この出力結果の見方は追々確認してゆく.

## 四則演算のテストをやってみる

ここでは四則演算のテストをやってみる.  
参考にさせて頂いたサイトはこれ↓.

- [PHPUnit入門の入門](https://simple-it-life.com/2016/02/25/phpunit/)

ここでは新しく `setUp()` メソッドを利用する.

> PHPUnit は、準備用のコードの共有をサポートしています。  
> 各テストメソッドが実行される前に、`setUp()`  
> という名前のテンプレートメソッドが実行されます。  
> `setUp()` は、テスト対象のオブジェクトを生成するような処理に使用します。
>
> -- [第4章 フィクスチャ | phpunit](https://phpunit.de/manual/6.5/ja/fixtures.html)

要するに, `setUp()` メソッドは, 各テスト実行前に何かしたい時に使えば良いってこと.

早速ファイルを作ってゆく.  
作成するファイルは次の通り.

- app
  - arithmetic.php
- tests
  - arithmeticTest.php

```php
// app/arithmetic.php

<?php

class Arithmetic
{
  public function add($x, $y) {
    return ($x + $y);
  }

  public function subtract($x, $y) {
    return ($x - $y);
  }

  public function multiply($x, $y) {
    return ($x * $y);
  }

  public function divide($x, $y) {
    return ($x / $y);
  }

}
```

本当は `divide()` で `0` で割ったときの例外処理を書いたほうがいいんだろうけど,  
今回は話を簡単にするためにスキップ.

```php
// tests/arithmeticTest.php

<?php

require_once (dirname(__FILE__). '/../vendor/autoload.php');
require_once (dirname(__FILE__). '/../app/arithmetic.php');

use PHPUnit\Framework\TestCase;

class ArithmeticTest extends TestCase
{
    protected $object;

    protected function setUp() {
        $this->object = new Arithmetic();
    }

    /**
     * add
     */
    public function testAdd() {
        $this->assertEquals(  0, $this->object->add(  0,   0));
        $this->assertEquals(100, $this->object->add(100,   0));
        $this->assertEquals(100, $this->object->add(  0, 100));
    }

    /**
     * subtract
     */
    public function testSubtract() {
        $this->assertEquals( 0, $this->object->subtract(0,  0));
        $this->assertEquals( 1, $this->object->subtract(1,  0));
        $this->assertEquals(-1, $this->object->subtract(0, -1));
    }

    /**
     * multiply
     */
    public function testMultiply() {
        $this->assertEquals(0, $this->object->multiply(0, 1));
        $this->assertEquals(1, $this->object->multiply(1, 1));
        $this->assertEquals(0, $this->object->multiply(1, 0));
    }

    /**
     * divide
     */
    public function testDivide() {
        $this->assertEquals(2, $this->object->divide(2, 1));
        $this->assertEquals(1, $this->object->divide(3, 3));
    }
}
```

テスト実行.

```sh
$ phpunit tests/arithmeticTest.php

PHPUnit 7.1.4 by Sebastian Bergmann and contributors.

.F..   4 / 4 (100%)

Time: 85 ms, Memory: 4.00MB

There was 1 failure:

1) ArithmeticTest::testSubtract
Failed asserting that 1 matches expected -1.

/vagrant/tests/arithmeticTest.php:31

FAILURES!
Tests: 4, Assertions: 11, Failures: 1.
```

Failしてる.

↑このメッセージからFail箇所を特定する.

- `.F.. 4 / 4 (100%)`
  - 全部で4つのメソッドが実行された
  - そのうち2番目のメソッドでfailした
- `Tests: 4, Assertions: 11, Failures: 1.`
  - 全 4 メソッド がテストされた
  - assertion は 11個 実行された
  - 1つが fail した
- `/vagrant/tests/arithmeticTest.php:31`
  - 31行目が怪しいよ
  - `Failed asserting that 1 matches expected -1.`
    - 期待値 `-1` に対して 実際は 1 が返ってきてるよ

この指摘はその通り.  
`0 - (-1) = 1` だから.  
この箇所を直せばテストがパスする.

```sh
$ phpunit tests/arithmeticTest.php

PHPUnit 7.1.4 by Sebastian Bergmann and contributors.

....  4 / 4 (100%)

Time: 99 ms, Memory: 4.00MB

OK (4 tests, 11 assertions)
```

ok.

以上でテストの基礎については完了.
