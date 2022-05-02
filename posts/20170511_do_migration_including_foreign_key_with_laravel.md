---
title: 'Laravel 外部キーを含むテーブルを migration ファイルで作成する'
tags: ['laravel']
created_at: '2017-05-11'
---

仕様が変わる度にDB構造も変化しちゃう.  
私が今開発中のプロジェクトはそんな状態.

これまではゴリゴリSQL文とshell scriptでDB作成・バックアップ・インポートetc...を行ってきた.  
でも, この作業も不毛だと思いまして.  
そろそろDB構造のバージョン管理をしたいので, migrationを使いながら覚えようと思う.

migrationファイルの基本的な文法については以前記事にまとめた.  
その時の記事はこちら.

[https://kengotakimoto.com/post-2375/](https://kengotakimoto.com/post-2375/)

## 動作環境

- centOS6.8
- Laravel5.3
- MySQL5.7.15

### 前提条件

- 次の2ファイルは設定済みとする
    - `.env`
    - `database.php`
- データベースは作成済みとする
    - 今回使用するDB: `gMapAppDB`
    - 今回使用するtable: `tickets`

## 参考

- [Laravel 5.3 データベース：マイグレーション | readouble.com](https://readouble.com/laravel/5.3/ja/migrations.html)
- [Laravel 5.dev マイグレーションと初期値設定 | readouble.com](https://readouble.com/laravel/5.dev/ja/migrations.html)

## 今回のゴール

今回のゴールは, 外部キーを含む `ticketsテーブル` をmigrationによって生成すること.

ticketsテーブルは, 何かしらのチケット情報を格納するテーブルだと思って頂ければokです.

私の環境では既にDBとテーブルがいくつか存在している.  
新たにmigrationを行うと何かしら不具合が生じると思うので, そのあたりもまとめてゆく.

## 今回作成する `tickets` テーブルについて

まずは今回作成する `tickets` テーブル について.

概要は次の通り.

- 最終的に欲しい `tickets` の構造
- `tickets` がどんな使われ方を想定しているのか

### 最終的に欲しい `tickets` の構造

最終的に `tickets` の構造は次のようになってほしい.

```
+------------+---------------------+------+-----+-------------------+----------------+
| Field      | Type                | Null | Key | Default           | Extra          |
+------------+---------------------+------+-----+-------------------+----------------+
| id         | int(10) unsigned    | NO   | PRI | NULL              | auto_increment |
| shop_id    | int(10) unsigned    | YES  | MUL | NULL              |                |
| menu_id    | int(10) unsigned    | YES  | MUL | NULL              |                |
| title      | varchar(256)        | NO   |     | title             |                |
| overview   | varchar(256)        | NO   |     | overview          |                |
| issues     | int(10) unsigned    | NO   |     | 0                 |                |
| left       | int(10) unsigned    | NO   |     | 0                 |                |
| enabled    | tinyint(1) unsigned | NO   |     | 0                 |                |
| start_date | datetime            | NO   |     | CURRENT_TIMESTAMP |                |
| end_date   | datetime            | NO   |     | CURRENT_TIMESTAMP |                |
| created_at | timestamp           | YES  |     | NULL              |                |
| updated_at | timestamp           | YES  |     | NULL              |                |
+------------+---------------------+------+-----+-------------------+----------------+
```

色々とフィールドがあるが, それほど実作業に影響はない.  
これらについては必要に応じて解説する.

indexは次の通り.

```sql
mysql> show index from tickets;
+---------+------------+--------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| Table   | Non_unique | Key_name     | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment |
+---------+------------+--------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| tickets |          0 | PRIMARY      |            1 | id          | A         |           4 |     NULL | NULL   |      | BTREE      |         |               |
| tickets |          1 | tickets_fk_1 |            1 | shop_id     | A         |           1 |     NULL | NULL   | YES  | BTREE      |         |               |
| tickets |          1 | tickets_fk_2 |            1 | menu_id     | A         |           1 |     NULL | NULL   | YES  | BTREE      |         |               |
+---------+------------+--------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
```

### `tickets` がどんな使われ方を想定しているのか

使われ方としては次のような状況を想定.

- 飲食店がお客さんに割引券を発行する
- その割引券には次の情報が含まれる
    - 店舗情報(shop\_id)
    - メニュー情報(menu\_id)
    - etc...

## migration 実行

基本的な書き方や文法については以前書いたこちらの記事を参照.  
[https://kengotakimoto.com/post-2375/](https://kengotakimoto.com/post-2375/)

概要は次の通り.

- migrationファイル 作成
- migrationファイル 編集
- migrationファイル 実行

### migrationファイル 作成

次のコマンドでmigrationファイルの生成が可能.

`php artisan make:migration create_テーブル名_table`

生成されたファイルは次の場所に格納される.  
\- `/database/migrations`

今回は `tickets`テーブルを作りたいので次のコマンドを実行する.

- `php artisan make:migration create_tickets_table`

```sh
[vagrant@local xxx]$ php artisan make:migration create_tickets_table

Created Migration: 2017_05_09_091333_create_tickets_table
```

ちゃんとできているか確認する.

```sh
[vagrant@local xxx]$ ls -la database/migrations/
total 24
drwxr-xr-x 6 501 games 204 May  9 09:13 .
drwxr-xr-x 6 501 games 204 Jan 23 01:11 ..
-rw-r--r-- 1 501 games   1 Jan 23 01:11 .gitkeep
-rw-r--r-- 1 501 games 738 Jan 23 01:11 2014_10_12_000000_create_users_table.php
-rw-r--r-- 1 501 games 684 Jan 23 01:11 2014_10_12_100000_create_password_resets_table.php
-rw-rw-r-- 1 501 games 425 May  9 09:13 2017_05_09_091333_create_tickets_table.php
```

作成されたファイルは次の通り.

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}

```

### migrationファイル 編集

最終的に作成したいテーブル構造は次の通り.  
冒頭で紹介したものと同じものを再掲.

```
+------------+---------------------+------+-----+-------------------+----------------+
| Field      | Type                | Null | Key | Default           | Extra          |
+------------+---------------------+------+-----+-------------------+----------------+
| id         | int(10) unsigned    | NO   | PRI | NULL              | auto_increment |
| shop_id    | int(10) unsigned    | YES  | MUL | NULL              |                |
| menu_id    | int(10) unsigned    | YES  | MUL | NULL              |                |
| title      | varchar(256)        | NO   |     | title             |                |
| overview   | varchar(256)        | NO   |     | overview          |                |
| issues     | int(10) unsigned    | NO   |     | 0                 |                |
| left       | int(10) unsigned    | NO   |     | 0                 |                |
| enabled    | tinyint(1) unsigned | NO   |     | 0                 |                |
| start_date | datetime            | NO   |     | CURRENT_TIMESTAMP |                |
| end_date   | datetime            | NO   |     | CURRENT_TIMESTAMP |                |
| created_at | timestamp           | YES  |     | NULL              |                |
| updated_at | timestamp           | YES  |     | NULL              |                |
+------------+---------------------+------+-----+-------------------+----------------+
```

こうなるようにmigrationファイルを編集してゆく.  
外部キーとして `shop_id`, `menu_id` を持つので, 外部キー制約設定がポイントになるかも.

最終的に出来上がったmigrationファイルは次の通り.

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTicketsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('tickets', function (Blueprint $table) {
      $table->increments('id')->default(NULL);
      $table->unsignedInteger('shop_id')->nullable()->default(NULL);
      $table->unsignedInteger('menu_id')->nullable()->default(NULL);
      $table->string('title')->default('title');
      $table->string('overview')->default('overview')->comment = '概要';
      $table->unsignedInteger('issues')->default(0)->comment = '発行数';
      $table->unsignedInteger('left')->default(0)->comment = '残り枚数';
      $table->tinyInteger('enabled')->default(0)->comment = 'ticketが有効か無効か';
      $table->dateTime('start_date');
      $table->dateTime('end_date');
      $table->timestamps();

      $table->index('shop_id');
      $table->index('menu_id');

      $table->foreign('shop_id')
            ->references('id')
            ->on('shops')
            ->onDelete('cascade')
            ->onUpdate('cascade');

      $table->foreign('menu_id')
            ->references('id')
            ->on('menus')
            ->onDelete('cascade')
            ->onUpdate('cascade');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('tickets');
  }
}
```

以下, ポイントを解説.

#### `nullable()`

NULL値を許可

#### `default(デフォルト値)`

デフォルト値の設定

#### `comment`

該当カラムが何を表しているのかをコメントとして記述.  
分かりにくいカラム名を付けてしまった場合に重宝する.

#### `timestamps()`

> NULL値可能なcreated\_atとupdated\_atカラム追加 引用 : [Laravel 5.3 データベース：マイグレーション | readouble.com](https://readouble.com/laravel/5.3/ja/migrations.html)

`created_at`, `updated_at` の2つを作成してくれるのがポイント.

#### index('カラム名');

**外部キー制約を用いる場合は, 対象のカラムにindexを作成する必要がある.**

次のコマンドによって手元のテーブルのindex設定が確認可能.

```sql
mysql> show index from tickets;
+---------+------------+--------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| Table   | Non_unique | Key_name     | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment |
+---------+------------+--------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| tickets |          0 | PRIMARY      |            1 | id          | A         |           4 |     NULL | NULL   |      | BTREE      |         |               |
| tickets |          1 | tickets_fk_1 |            1 | shop_id     | A         |           1 |     NULL | NULL   | YES  | BTREE      |         |               |
| tickets |          1 | tickets_fk_2 |            1 | menu_id     | A         |           1 |     NULL | NULL   | YES  | BTREE      |         |               |
+---------+------------+--------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
```

#### `onDelete()`, `onUpdate()`

親テーブルの削除・更新時の子テーブルの挙動を設定する.  
親子関係は次の通り.

- 子テーブル
    - `tickets`
- 親テーブル
    - `shops`
    - `menus`

設定したオプション `cascade` の意味は次の通り.

| オプション | Delete時の挙動 | Update時の挙動 |
| :-- | :-- | :-- |
| `cascade` | 参照先がなくなると同時に削除 | 参照先の変更に追従 |

ここまででmigrationファイルが作成完了.

### migration実行

作成したmigrationファイルを元に, テーブルが期待通りに作成されていることを確認する.

同名のテーブルがすでに存在する場合には次のようなエラーが出るので注意.

```sh
[vagrant@localhost xxx]$ php artisan migrate


  SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'tickets' already exists (SQL: create table `tickets` (`id` int unsigned not nu  
  ll auto_increment primary key, `shop_id` int unsigned null, `menu_id` int unsigned null, `title` varchar(255) not null default 'title', `overv  
  iew` varchar(255) not null default 'overview' comment '概要', `issues` int unsigned not null default '0' comment '発行数', `left` int unsigned  
   not null default '0' comment '残り枚数', `enabled` tinyint not null default '0' comment 'ticketが有効か無効か', `start_date` datetime not nul  
  l, `end_date` datetime not null, `created_at` timestamp null, `updated_at` timestamp null) default character set utf8 collate utf8_unicode_ci)  



  SQLSTATE[42S01]: Base table or view already exists: 1050 Table 'tickets' already exists  
```

いざ、実行.

```sh
[vagrant@localhost xxx]$ php artisan migrate
Migrated: 2017_05_09_091333_create_tickets_table
```

### MySQLで確認

MySQLにログインして確認してみる.

```sql
mysql> select * from tickets;
Empty set (0.01 sec)
```

ふむふむ.

```sql
mysql> show create table tickets \G
*************************** 1. row ***************************
       Table: tickets
Create Table: CREATE TABLE `tickets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` int(10) unsigned DEFAULT NULL,
  `menu_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'title',
  `overview` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'overv
iew' COMMENT '概要',
  `issues` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '発行数',
  `left` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '残り枚数',
  `enabled` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'ticketが有効か無効か
',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tickets_shop_id_index` (`shop_id`),
  KEY `tickets_menu_id_index` (`menu_id`),
  CONSTRAINT `tickets_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES
 `menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tickets_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES
 `shops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)
```

うん、成功してるね.

余談だが, ↑このSQL文末尾を `\G;`(セミコロンを付ける) と, 出力結果に

```
ERROR: 
No query specified
```

と表示されてしまう.  
気になる人は `;(セミコロン)` は付けないように.

今回は以上.
