---
title: 'Laravel migrationファイルの基本的な書き方'
tags: ['laravel']
created_at: '2017-05-10'
---

デフォルトで用意されているmigrationファイルを眺めて基本的な書き方を学ぶ.  
概要は次の通り.

## 動作環境

- centOS6.8
- Laravel5.3
- MySQL5.7.15

## 参考

- [Laravel 5.3 データベース：マイグレーション | readouble.com](https://readouble.com/laravel/5.3/ja/migrations.html)
- [Laravel 5.dev マイグレーションと初期値設定 | readouble.com](https://readouble.com/laravel/5.dev/ja/migrations.html)

## migrationってなに

> マイグレーションはデータベースをバージョンコントロールする一手法です。
>
> -- [Laravel 5.dev マイグレーションと初期値設定 | readouble.com](https://readouble.com/laravel/5.dev/ja/migrations.html)

つまりこういうこと.

- Laravelにおけるmigraitonとは
- migraitonファイル と
- laravelのコマンド で
- DBのtable がいい感じに作れる
- そして, テーブルをある状態まで戻すこと(ロールバック)が可能

## migrationで何ができるのか

次のようなことが可能.

- テーブル作成
- テーブル更新
- ロールバック

ロールバックとは, テーブルを過去の状態に戻すこと.

## migrationの使い方

migration実行手順はざっくり次のようになる.

1. SQL文でDB作成 (済)
2. migrationファイルを作成
    - ここでどんなテーブル構造にするかを定義する
3. migration実行
    - migrationファイルで定義した通りにテーブルが作成される
4. MySQLで確認
    - 意図したテーブルが出来上がっているか確認する

今回は既存のmigrationファイルを眺めるので, これらの手順は踏まない. これらの手順を踏み, migrationファイルを作成した記事はこちら.

[https://kengotakimoto.com/post-2378/](https://kengotakimoto.com/post-2378/)

## デフォルトで用意されているmigraitonファイルを眺める

次のファイルの中身を見てみる.

- `/database/migrations/2014_10_12_000000_create_users_table.php`

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
    }
}
```

### `up`メソッド, `down`メソッド について

- `up`メソッド
    - 新しいテーブル、カラム、インデックスをDBに追加するために使用する
- `down`メソッド
    - `up`メソッドが行った操作を元に戻す

### `Schema::create()`

`up`メソッドを見ると `Schema::create()` が使われている.

- `Schema::create('テーブル名', クロージャ)`
    - 新たなテーブルを作成する
    - 第1引数はテーブル名
    - 第2引数はテーブル構造を定義するクロージャ
        - クロージャ内で定義するのは, いわゆるテーブル構造
        - 型だったり, 文字列長だったり。

### `$table->メソッド`

ここではテーブル構造を定義している.  
使用可能なメソッドは公式ドキュメントで紹介されている.

- [使用できるカラムタイプ | readouble.com](https://readouble.com/laravel/5.3/ja/migrations.html#creating-columns)

一先ず, ここで使われているメソッドの意味をまとめてみる.

> | 指定可能なカラムタイプ(抜粋) | 意味 |
> | :-- | :-- |
> | `increments()` | PRIのこと |
> | `string()` | VARCHARのこと |
> | `unique()` | 指定したカラムの値を一意にする |
> | `rememberToken()` | VARCHAR(100) NULLのremember\_tokenを追加 |
> | `timestamps()` | NULL値可能な`created_at`, `updated_at`カラム追加 |
>
> -- [使用できるカラムタイプ | readouble.com](https://readouble.com/laravel/5.3/ja/migrations.html#creating-columns)

`()` 内にカラム名を指定する.

ここでは次の2点に注目.

- `unique()`
- `rememberToken()`

#### unique について

「指定したカラムの値を一意にする」 っていう言い方は少し難しい.  
つまり, 一つのテーブル内で同じ値を持っちゃダメ, という宣言をしているということ

今回の例では `email` カラムに対して`unique`が適用されている.

> `$table->string('email')->unique();`

つまり, 一つのテーブル内で同じメールアドレスの登録を禁止するということ.

#### remember\_token について

なんとなく利用していた `remember_token` について.  
remember\_tokenは次の目的で使用される.

> #### 継続ログイン
>
> アプリケーションでログイン維持(Remember me)機能を持たせたい場合は、  
>
> (中略)
>
> もちろん、"remember me"トークンを保存するために使用する文字列のremember\_tokenカラムをusersテーブルに持たせる必要があります。
>
> -- [Laravel 5.3 認証 | readouble.com](https://readouble.com/laravel/5.3/ja/authentication.html)

もしLaravelでログイン機能を実装するのなら, このカラムは用意した方が良さそう.

今回は以上.
