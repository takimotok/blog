---
title: 'laravel seederの方法: ディレクトリ構成'
tags: ['laravel']
created_at: '2018-05-13'
updated_at: ''
---

seederを行う前に, まずlaravelのディレクトリ構成について知っておいた方がいい.  
私はここが理解できなくて長い間ハマった.

使用するコマンドは各記事で紹介するので, ここでは次の点を解説.

- ディレクトリ構成
- ファイル呼び出し概念

## 動作環境

- laravel 5.5.40
- php 7.2.5

### 備考

- vagrant環境にcentos7を入れて動作させている

## 前提条件

### 外部キーを持ってるから親テーブルにはデータ挿入済 を想定

今回は `DB.shops` というテーブルにダミーデータを挿入する例について考える.  
このテーブルは外部キーとして次のカラムを持つ.

- user\_id
- grade\_id

seeder実行時には, 予め `DB.users`, `DB.grades` にデータが入っていることを前提としている.  
本記事の内容だけ実行してもエラーになるので注意しよう.

もしエラーを回避したい場合は, 本記事と同じ要領で事前に `DB.users`, `DB.grades` 等にダミーデータを生成すれば良い.

## 本記事で解説すること

![](/images/pages/posts/20180513/seeder.png)

↑この図に沿ってseederに関係するディレクトリ, ファイルについて解説する.  
解説したいのは図中の3点.

1. 関係するディレクトリ
2. 呼び出したいseederファイルを指定
3. 利用するダミーデータの「もと」を作成・参照

以下, それぞれについて解説.

## ① 関係するディレクトリ

![](/images/pages/posts/20180513/seeder.png)

図の①について.  
ここではseederで使うディレクトリについて解説.

まず, `/database/` 以下のディレクトリを見てみる.

```sh
$ tree -d ./database/
./database/
├── factories
├── migrations
└── seeds
```

`migrations` は今回の解説対象外.  
seedingを行う上でダミーデータを生成する際, 直接関係するのは次のディレクトリにあるファイルだ.

- /database/
    - factories
    - seeds

各ディレクトリに置くファイルの役割は次の通り.

- /database/factories
    - ダミーデータの「もと」をここで作る
    - ダミーデータを簡単に利用するために `Faker` を利用する
- /database/seeds
    - 基本的には 「ダミーデータをいくつ挿入したいか」 だけを記述する
    - もし中間テーブルへダミーデータを突っ込みたい場合は, ここのファイルで定義する

細かいことは無視していい.  
基本的にはこの2つのディレクトリがseeder実行時に関係してくることを意識する.  
そして, ダミーデータ生成の責務は `/database/factories` が担うことだけ知っておけば良い.

## ② 呼び出したいseederファイルを指定

![](/images/pages/posts/20180513/seeder.png)

図の②について.  
ここでは `/database/seeds` 内ファイルの相互関係について解説.

ここに置かれるファイルはコマンドで作成可能.  
というか, コマンドを発行して生成した方がいい.

たとえば `DB.users` 用のseederファイルを生成したいなら次のようなコマンドを発行する.

```sh
$ php artisan make:seeder UsersTableSeeder
```

ファイル命名規則は特にないみたいだが, ↑この例のように  
`テーブル名TableSeeder`  
とcamelcaseで書くのがいいだろう.

このコマンドを発行すると, 次の場所にファイルが作成される.

- /database/seeds/UsersTableSeeder.php

ファイルの記述方法についてはここでは触れない.

大事なのは **このファイルを生成して編集するだけでは不十分だ** ということ.

つまり, `/database/seeds/DatabaseSeeder.php` で呼び出す必要がある, ということ.  
これだけ気をつけよう.

図の②で言いたいのは, **生成したseederファイルは DatabaseSeeder.php でちゃんと指定してね！** ってこと.

具体的な呼び出し方は他の記事で紹介する.  
今はこれだけを意識しておこう.

## ③ 利用するダミーデータの「もと」を作成・参照

![](/images/pages/posts/20180513/seeder.png)

図の③について.  
ここでは次の点を淡々と解説する.

- `/database/seeds/xxxxTableSeeder.php` が
- `/database/factories/xxxFactory.php` を参照しているよ

これは実際のテーブルや各ファイルを見た方が分かりやすいかも知れない.

ここでは次のテーブルにダミーデータを突っ込むことを想定して解説する.

- `DB.shops` テーブルに
- モデルファクトリを利用して
- ダミーデータを突っ込む

細かいコマンドは紹介しない.  
各ファイルが何を参照しているかだけ意識して欲しい.

ここでは次の順番でダミーデータの「もと」(モデルファクトリ) について紹介する.

1. `DB.shops`テーブルの構成
2. モデルファクトリ記述内容
    - /database/factories/ShopsFactory.php
3. seederファイル記述内容
    - /database/seeds/ShopsTableSeeder.php
        - モデルファクトリを参照しているよ
        - 何レコード追加するかだけを定義しているよ
4. DatabaseSeeder.php で呼び出す
    - `DB.shops` にデータを突っ込むのはいいけど, どのファイルを参照すればいいの？ をlaravelに教える

以下, 解説.

### `DB.shops`テーブルの構成

今回使用する `DB.shops` のschemaは次の通り.

```sql
show create table shops\G
*************************** 1. row ***************************
       Table: shops
Create Table: CREATE TABLE `shops` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `grade_id` int(10) unsigned DEFAULT NULL,
  `place_id` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'GMpasAPI規定のもの',
  `latlng` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '緯度経度',
  `corp_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tel` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `open` time DEFAULT NULL,
  `close` time DEFAULT NULL,
  `issues` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '発行数',
  `left` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '残り枚数',
  `disabled` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0:有効, 1:無効',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shops_user_id_index` (`user_id`),
  KEY `shops_grade_id_index` (`grade_id`),
  CONSTRAINT `shops_grade_id_foreign` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `shops_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)
```

`DB.shops` は次のような使われ方を想定している.  
(細かい点の説明は省く)

- 飲食店情報を格納したい
- 外部キー
    - user\_id
    - grade\_id
    - place\_id
- latlng
    - 緯度経度
- corp\_name
    - 企業名
- open
    - 開店時刻
- close
    - 閉店時刻
- created\_at
- updated\_at

各カラムの意味は今回本質的ではないので気にしなくて良い.  
「あー、こんなテーブルに対してダミーデータを突っ込むんだね」 程度でok.

### モデルファクトリ記述内容

まずダミーデータのもとを作成する.  
記述するファイルはこれ↓

- /database/factories/ShopsFactory.php

記述内容は次の通り.

```php
<?php

use Carbon\Carbon;

$factory->define(App\Shop::class, function (Faker\Generator $faker) {
    $userIDs  = App\User::pluck('id')->all();
    $gradeIDs = App\Grade::pluck('id')->all();

    $opens = [
        '07:00:00',
        '08:00:00',
        '09:00:00',
        '10:00:00',
    ];
    $closes = [
        '20:00:00',
        '21:00:00',
        '22:00:00',
        '23:00:00',
        '00:00:00',
    ];
    $disables = [
        0,
        1
    ];

    $carbon = new Carbon();
    return [
        'user_id'    => $faker->randomElement($userIDs),
        'grade_id'   => $faker->randomElement($gradeIDs),
        'place_id'   => NULL,
        'latlng'     => '{'.
                            'latitude:' . $faker->latitude . ','.
                            'longitude:'. $faker->longitude.
                        '}',
        'corp_name'  => $faker->company,
        'tel'        => $faker->phoneNumber,
        'address'    => $faker->address,
        'open'       => $faker->randomElement($opens),
        'close'      => $faker->randomElement($closes),
        'issues'     => $faker->numberBetween($min = 100, $max = 200),
        'left'       => $faker->numberBetween($min = 0  , $max = 100),
        'disabled'   => $faker->randomElement($disables),
        'created_at' => $carbon->now(),
        'updated_at' => $carbon->now(),
    ];
});
```

いくつかポイントだと思う箇所を解説.

- `use Carbon\Carbon;`
    - 日付, 時刻 を簡単に扱いたいから `Carbon` を利用
- `$factory->define(App\Shop::class, function (Faker\Generator $faker) {xxx}`
    - ダミーデータを突っ込みたいのは `DB.shops`
        - だから `App\Shop::class` を指定
    - ダミーデータ生成を楽に行うために `Faker` を利用
- `$userIDs = App\User::pluck('id')->all();`
- `$gradeIDs = App\Grade::pluck('id')->all();`
    - 外部キーはこうやって持ってこれる

記述方法については以上.

### seederファイル記述内容

続いて seederファイル記述方法について.  
先程モデルファクトリでダミーデータの「もと」を記述した.  
ここでは何レコード用意したいかのみ指定すればいい.

seederファイルは次のコマンドで用意.

```sh
$ php artisan make:seeder ShopsTableSeeder
```

このコマンドで, 次の場所にファイルが生成される.

- /database/seeds/ShopsTableSeeder.php

このファイルを次のように編集.

```php
<?php

use Illuminate\Database\Seeder;

class ShopsTableSeeder extends Seeder
{
    public function run()
    {
        factory(App\Shop::class, 10)->create();
    }
}
```

ここでも気になるポイントだけ解説.

- `run()`
    - seederファイル生成時に勝手に用意されている
- `factory()`
    - モデルファクトリで定義したダミーデータの「もと」を指定
    - `10`
        - ここでは 10レコード ダミーデータを挿入する
- `create()`
    - 作るよっ, って合図

seederファイル記述内容については以上.

### DatabaseSeeder.php で呼び出す

最後に, 次の点をlaravelに教えてあげる.

- `DB.shops` にデータを突っ込むのはいいけど, どのファイルを参照すればいいの？

次のファイルを編集する.

- /database/seeds/DatabaseSeeder.php

```php
<?php

// /database/seeds/DatabaseSeeder.php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call(UsersTableSeeder::class);# 外部キーの親テーブルにもダミーを突っ込む
        $this->call(GradesTableSeeder::class);# 外部キーの親テーブルにもダミーを突っ込む
        $this->call(ShopsTableSeeder::class);
    }
}
```

本記事冒頭で前提条件を書いたけど,  
`UsersTableSeeder` `GradesTableSeeder` は外部キーの親テーブル.  
これらは事前にダミーデータ生成済みとする.

本記事と同じようにモデルファクトリ, seederファイルを作ればよい.

ここまでできたら, seeder実行してみる.

`$ php artisan db:seed`

ここまでの手順が正しく踏めていれば, DB.shops にダミーデータが挿入されているはず.

```sql
 select count(*) from shops\G
*************************** 1. row ***************************
count(*): 10
1 row in set (0.00 sec)
```

うん.  
10レコード挿入されてるね.

細かいコマンドはともかく,

- どのディレクトリで
- どのファイルが
- 何を参照しているか

の感覚を掴んで欲しい.

今回は以上.
