---
title: 'Laravel 多対多のrelationを実現する方法'
tags: ['laravel']
created_at: '2017-05-17'
---

Laravelで多対多のデータを扱いたい.  
基本的な使い方をまとめる.  
今回のゴールは次の通り.

- 関係するテーブルの把握ができる
- 中間テーブルについて理解する
- 中間テーブルからデータを取得する

概要は次の通り.


## 動作環境

- centOS6.8
- Laravel5.3
- MySQL5.7.15

### 前提条件

- 次のファイルは設定済みとする.  
    
    - `.env`
    - `database.php`
- 今回使用するテーブルは次の2つ
    
    - `facilities`
    - `shops`

この2テーブルは既にDBに存在するものとする.  
中間テーブルはまだ存在しない状態.


## 参考

- [多対多 | readouble.com](https://readouble.com/laravel/5.3/ja/eloquent-relationships.html#many-to-many)


## 手順

概要は次の通り.

- 中間テーブルとは
- 中間テーブルを準備
- 各Modelに `belongsToMany()` を記述
- 中間テーブルからデータを取得

### 中間テーブルとは

実際の作業に入る前に, 中間テーブルの特徴について簡単にまとめる.

中間テーブルとは, あるテーブルと他のテーブルを関連付けるテーブルの事.  
このあたりは, DBのrelationについて別途勉強しないと理解できないと思う.  
今回は `facilities`テーブル, `shops`テーブルを関連付ける中間テーブルとして

- `facility_shop` テーブル

を利用する.

さて, そもそも多対多のrelationを考えるうえで大切なことは


ということ.  

たとえば, `users`, `roles` という2テーブルで多対多のrelationを定義したい場合は  
`role_user`という中間テーブルが必要になる.

> users,roles,role\_userの３テーブルがこの関係には必要です. 引用: [多対多 | readouble.com](https://readouble.com/laravel/5.3/ja/eloquent-relationships.html#many-to-many)

つまり, 今回作成する中間テーブル(`facility_shop`)には次のカラムを持つ必要がある.

- `facility_id`
- `shop_id`

↑これを日本語に訳すとこういうこと↓

- どのshopが
- どのfacilityを持つのかを
- 一覧で見たい
- そのためのテーブルが `facility_shop`

#### 中間テーブル命名規則 と 必要なカラム

中間テーブル命名規則は次の通り.

##### 命名ルール

```
- アルファベット順
- スネークケースで
- テーブル名の 単数形 を繋げる
```

今回は shops, facilities の2テーブル間で多対多のrelationを定義する.  
命名ルールに従うと中間テーブル名は次のようになる.

- `facility_shop`

### 中間テーブルを準備

ここから作業を開始する.  
今後のバージョン管理を考えてmigratoinによって中間テーブルを作成する.  
多対多のrelationでは中間テーブルが必要.

次のコマンドでmigrationファイルを作成.  
`$ php artisan make:migration create_facility_shop_table`

```
$ php artisan make:migration create_facility_shop_table
Created Migration: 2017_05_13_060752_create_facility_shop_table
```

次にmigrationファイル作成.  
今回は次のような構成にした.

```
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFacilityShopTable extends Migration
{
  public function up()
  {
    Schema::create('facility_shop', function(Blueprint $table) {
      $table->primary('id');// <- これ忘れないように
      $table->unsignedInteger('facility_id');
      $table->unsignedInteger('shop_id');
      $table->timestamps();

      $table->index('facility_id');
      $table->index('shop_id');

      $table->foreign('facility_id')
            ->references('id')
            ->on('facilities')
            ->onDelete('cascade')
            ->onUpdate('cascade');

      $table->foreign('shop_id')
            ->references('id')
            ->on('shops')
            ->onDelete('cascade')
            ->onUpdate('cascade');

    });
  }

  public function down()
  {
    Schema::dropIfExists('facility_shop');
  }
}

```

中間テーブルには, 関連付ける2テーブルのidを持つ必要がある.  
今回の例では次の2つのid.

- facility\_id
- shop\_id

で, このidばかりに気を取られがちなので注意.  
通常の主キーとして `id` を定義するのも忘れずに.

### 各Modelに `belongsToMany()` を記述

次のモデルにそれぞれ `belongsToMany()` を記述する.

- Facility.php
- Shop.php

```
<?php
// Facility.php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    protected $table = 'facilities';

    public function shops(){
        return $this->belongsToMany('App\Shop', 'facility_shop');
    }

}

```

```
<?php
// Shop.php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $table = 'shops';


    public function facilities(){
        return $this->belongsToMany('App\Facility');
    }
}
```

`belongsToMany` の第一引数は名前空間の定義によって若干書き方が異なるので注意.

ここまでで下準備は完了.

私は次の点で数時間躓いた.

- 主キーの入れ忘れ
- モデルファイル名を `Facility.php` とすべきところを `Facilitiy.php`(iが多い)という凡ミス

一人で開発をしているとこういうミスを連発する.  
気をつけよう.

### 中間テーブルからデータを取得

ドキュメントを読むと `pivot` を使うといいよ, と当然のように書いてある.  
このあたりを丁寧に追ってゆく.

まず, 次のテーブルにダミーデータを用意.

- facilities
- shops
- facility\_shop


#### facilities

```
+----+-----------------------+------------+------------+
| id | facility              | created_at | updated_at |
+----+-----------------------+------------+------------+
|  1 | 電源                  | NULL       | NULL       |
|  2 | wifi                  | NULL       | NULL       |
|  3 | 禁煙                  | NULL       | NULL       |
|  4 | フリードリンク        | NULL       | NULL       |
+----+-----------------------+------------+------------+
```

#### shops

```
+----+---------+----------+-----------+-------------+---------+----------+----------+---------------------+---------------------+
| id | user_id | grade_id | corp_name | tel         | address | open     | close    | created_at          | updated_at          |
+----+---------+----------+-----------+-------------+---------+----------+----------+---------------------+---------------------+
|  2 |       3 |        1 | starbucks | 09088881112 | ii      | 07:30:00 | 23:00:00 | 2017-02-16 03:14:21 | 2017-02-16 03:14:21 |
|  3 |       3 |        1 | corp_3    | 8099990003  | iik     | 07:30:00 | 22:30:00 | 2017-05-16 09:16:18 | 2017-05-16 09:16:18 |
|  4 |       4 |        2 | corp_4    | 8099990004  | iik     | 07:30:00 | 22:30:00 | 2017-05-16 09:16:18 | 2017-05-16 09:16:18 |
|  5 |      26 |        3 | corp_26   | 8099990026  | iik     | 07:30:00 | 22:30:00 | 2017-05-16 09:16:18 | 2017-05-16 09:16:18 |
+----+---------+----------+-----------+-------------+---------+----------+----------+---------------------+---------------------+
```

`id=2` だけそれっぽい名前を入れてしまったが, 気にしない.  
ダミーなので.

#### facility\_shop

```
+----+-------------+---------+---------------------+---------------------+
| id | facility_id | shop_id | created_at          | updated_at          |
+----+-------------+---------+---------------------+---------------------+
|  1 |           1 |       2 | NULL                | NULL                |
|  2 |           2 |       2 | NULL                | NULL                |
|  3 |           3 |       2 | NULL                | NULL                |
|  4 |           4 |       2 | NULL                | NULL                |
|  5 |           1 |       3 | 2017-05-16 09:21:13 | 2017-05-16 09:21:13 |
|  6 |           2 |       3 | 2017-05-16 09:21:13 | 2017-05-16 09:21:13 |
|  7 |           3 |       4 | 2017-05-16 09:21:13 | 2017-05-16 09:21:13 |
|  8 |           4 |       5 | 2017-05-16 09:21:13 | 2017-05-16 09:21:13 |
|  9 |           1 |       4 | 2017-05-16 09:21:13 | 2017-05-16 09:21:13 |
+----+-------------+---------+---------------------+---------------------+
```

`NULL` が気になるが, 今回はスルー.

中間テーブルからデータを取得してみる.  
今回は次の条件でデータを取得.

- `shop_id=4` と関連する `facility` のデータを取得

以下, 適当なコントローラに記述.

```
$shop = Shop::find(4);// shop_id= 4 のデータを取得
$facilities = $shop->facilities;// Shop.php で定義したメソッド
var_dump($facilities);exit; // 結果を見たいから一旦動作を停止させる
```

実行結果

```
array (size=2)
  0 => 
    array (size=5)
      'id' => int 3
      'facility' => string '禁煙' (length=6)
      'created_at' => null
      'updated_at' => null
      'pivot' => 
        array (size=2)
          'shop_id' => int 4
          'facility_id' => int 3
  1 => 
    array (size=5)
      'id' => int 1
      'facility' => string '電源' (length=6)
      'created_at' => null
      'updated_at' => null
      'pivot' => 
        array (size=2)
          'shop_id' => int 4
          'facility_id' => int 1
```

この時点で, `shop_id=4` と関連する `facilities` のデータは配列として全て取得されている.  
たぶん.

あとは `foreach` で好きなようにデータを扱う.

今回は以上.
