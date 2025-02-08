---
title: 'Laravel 複数レコードを一気にDBへ格納する方法'
tags: ['laravel']
created_at: '2017-07-26'
updated_at: ''
---

Laravelで複数レコードを一気にテーブルに追加したい.  
`foreach()` & `save()` はなんとなくイケてない気がする.  
こんなモチベーションでLaravelにおけるDB格納方法を調査した.

新規レコード追加方法は主に次の3つらしい.

- `save()`
- `create()`
- `insert()`

今回はこれらの違いについて調査.

## 参考

- [Laravel 5.3 Eloquent：利用の開始 | readouble.com](https://readouble.com/laravel/5.3/ja/eloquent.html)
- [Laravel 5.3 データベース：クエリビルダ | readouble.com](https://readouble.com/laravel/5.3/ja/queries.html)

## 動作環境

- Laravel 5.3
- PHP 5.6.x
- MySQL 5.7.15
- CentOs 6.8
- Apache 2.4

### 前提条件

次の点を前提とする.

- vagrant + virtualBox で構築したローカル開発環境で動作させる
- `cofig/database.php` 設定済
- `.env` 設定済
- model 作成済
- 今回は `tstDB.users` テーブルを利用する

### 今回使用する DB, table について

今回は次のようなDBで作業する.

- DB : `tstDB`
- table : `users`
- model名: `User.php`

#### table : `users`

テーブル構造は次の通り.

- `$ desc users;`

```
mysql> desc users;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int(11)      | NO   | PRI | NULL    | auto_increment |
| name       | varchar(255) | YES  |     | NULL    |                |
| created_at | datetime     | YES  |     | NULL    |                |
| updated_at | datetime     | YES  |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
4 rows in set (0.01 sec)
```

#### model名: `User.php`

```
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    protected $guarded = ['id'];

}
```

### ルーティングとか

今回は view は用意せず, Controller から Model を呼び出して `var_dump` でブラウザ表示する.  
使用するファイルは次の通り.

- `/routes/web.php`
- `/app/Http/Controllers/IndexController.php`
- `/app/User.php`

ファイルの中身は次の通り.

#### `/routes/web.php`

```
Route::get('/', 'IndexController@getIndex');
```

#### `/app/Http/Controllers/IndexController.php`

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use \App\User;// access Model


class IndexController extends Controller
{

  public function getIndex() {

    $users = User::all()->toArray();
    var_dump($users);exit;
  }

}
```

#### `/app/User.php`

```
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    protected $guarded = ['id'];

}
```

## 結論

先に結論から.

複数コードを一気にDBへ格納したい場合は `insert()` を使えばいい.  
使用例は次の通り.

```
public function getIndex() {

  // define params
  $name_01 = 'tstTakimuto'; // たけむと
  $name_02 = 'tstTakimeto'; // たきめと
  $name_03 = 'tstTakimota'; // たきもた
  $now = Carbon::now();// 2017-07-26 02:11:22

  $datum = [
    ['name' => $name_01, 'created_at' => $now, 'updated_at' => $now],
    ['name' => $name_02, 'created_at' => $now, 'updated_at' => $now],
    ['name' => $name_03, 'created_at' => $now, 'updated_at' => $now]
  ];

  // save into tstDB.users
  $cli = DB::table('users')
          -> insert($datum);

  var_dump($cli);exit;
}
```

格納したいデータを配列でまとめて `insert()` する.  
これで目的は達成可能.

以下, 先述した3つの方法を確認してゆく.

## `save()`

基本的にはモデルインスタンスを作成して使用するメソッド.  
つまり `new` してから使うということ.

> モデルから新しいレコードを作成するには新しいインスタンスを作成し、saveメソッドを呼び出します。
>
> -- [Laravel 5.3 Eloquent：利用の開始 | readouble.com](https://readouble.com/laravel/5.3/ja/eloquent.html)

### 特徴

`save()` の特徴は次の通り.

- 新レコード 追加
- 既存モデル 更新
  - `where` 句を使って複数レコードの一括更新も可能
- タイムスタンプ (`created_at`, `updated_at`) が自動設定される

`save()` メソッドはレコードの新規作成だけでなく, 更新(update) もできる.

### 実際にやってみる

`save()` メソッドを使ってみる.

```
// IndexController.php

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use \App\User;// access Model


class IndexController extends Controller
{

  public function getIndex() {

    // define params
    $name = 'tstTakimoto';

    // save into tstDB.users
    $cli_user = new User;
    $cli_user->name = $name;
    $cli_user->save();

    var_dump($cli_user->toArray());exit;
  }

}
```

実行結果 (ブラウザ)

```
array (size=4)
  'name' => string 'tstTakimoto' (length=11)
  'updated_at' => string '2017-07-24 02:10:35' (length=19)
  'created_at' => string '2017-07-24 02:10:35' (length=19)
  'id' => int 1
```

`$cli_user` インスタンスに↑これが格納されたっぽい.

DBも確認しておく.

```
mysql> select * from users;
+----+-------------+---------------------+---------------------+
| id | name        | created_at          | updated_at          |
+----+-------------+---------------------+---------------------+
|  1 | tstTakimoto | 2017-07-24 02:10:35 | 2017-07-24 02:10:35 |
+----+-------------+---------------------+---------------------+
```

### 新たなデータを格納してみる

`$name` を変えて再度格納すると次のような結果になる.

```
// IndexController.php

public function getIndex() {

    // define params
    $name = 'tstTakumoto'; // たくもと

    // save into tstDB.users
    $cli_user = new User;
    $cli_user->name = $name;
    $cli_user->save();

    var_dump($cli_user->toArray());exit;
  }
```

↑今後は `tstTakumoto` (たきもと じゃなく たくもと) として実行.

実行結果 (ブラウザ)

```
array (size=4)
  'name' => string 'tstTakumoto' (length=11)
  'updated_at' => string '2017-07-24 02:15:09' (length=19)
  'created_at' => string '2017-07-24 02:15:09' (length=19)
  'id' => int 2
```

実行結果 (DB)

```
mysql> select * from users;
+----+-------------+---------------------+---------------------+
| id | name        | created_at          | updated_at          |
+----+-------------+---------------------+---------------------+
|  1 | tstTakimoto | 2017-07-24 02:10:35 | 2017-07-24 02:10:35 |
|  2 | tstTakumoto | 2017-07-24 02:15:09 | 2017-07-24 02:15:09 |
+----+-------------+---------------------+---------------------+
```

### ここまでのまとめ

`save()` メソッドを実行したインスタンスには, 過去に `tstDB.users` に格納した**全データが渡させるわけじゃない**.  
インスタンスには直前に格納したレコードが格納される.

ドキュメントにもある通り, アクティブレコード的な取扱ってこと.

## `create()`

`create()` の特徴は次の通り.

- 新レコード 追加
- 複数代入
  - 必ず `$fillable` または `$guarded` を指定する

複数代入 っていう言葉だと動作がイメージし辛い.  
ここで複数代入について少し解説.

### 複数代入 = 入力フォーム項目名と同名カラムに一気にデータを突っ込むこと

> フォームの入力名とデータベースのカラム名を同じにして、入力値をデータベース（もしくはORMがインスタンスのモデル）へ一気に代入してしまおうと言うアイデア
>
> -- [Eloquentの複数代入のリスク | kore1server.com](https://kore1server.com/336/Eloquent%E3%81%AE%E8%A4%87%E6%95%B0%E4%BB%A3%E5%85%A5%E3%81%AE%E3%83%AA%E3%82%B9%E3%82%AF)

kore1server.com 管理人の川瀬裕久さんは 本記事でたくさん引用している [readouble.com](https://readouble.com/) の日本語翻訳者.  
いつもお世話になっております.

複数代入 とは次のような概念のことらしい.

- 入力フォーム項目名と同名カラムをテーブルに用意して
- そこに一気にデータを格納すること

### 複数代入の何が問題か

[さきほど紹介した川瀬さんのブログ](https://kore1server.com/336/Eloquent%E3%81%AE%E8%A4%87%E6%95%B0%E4%BB%A3%E5%85%A5%E3%81%AE%E3%83%AA%E3%82%B9%E3%82%AF) にセキュリティリスクについて具体例が書いてあるので参照してほしい.

フォーム送信時はたいてい `POST` メソッドを選択するはず.  
Laravelではセキュリティ対策として CSRFトークン も一緒に送信される.  
だから, ControllerやModelから見ると入力フォームの項目数と実際に受け取ったデータ数が異なってしまう.

悪意のあるユーザはこの点を上手く利用して, 勝手にテーブル操作しちゃう.  
たとえば, 管理者権限を持つユーザとして新規レコード追加するとか.

こういうことが起きたら困るから, 予め次の点を決めておく必要がある.

- レコードを追加して良いカラム
  - `$fillable` で設定 (ホワイトリスト)
- レコードを追加しはいけないカラム
  - `$guarded` で設定 (ブラックリスト)

少し長くなったけど, セキュリティリスクが背景にあるから複数代入をするときは

- `$fillable` または
- `$guarded`

を設定する必要があるということ.

基本的に `create()` を行う時は必ず `$fillable` または `$guarded` を設定する, と覚えておく.

複数代入については以上.

### 実際にやってみる

実際に `create()` を使ってみる.

今回は複数代入の処理も必要になる.  
手順は次の通り.

1. `User.php` に `$guarded` を定義
2. `IndexController.php` に `create()` を記述
3. ブラウザとDBで確認

以下, 詳細.

### `User.php` に `$guarded` を定義

今回はブラックリスト的に,複数代入の禁止項目を定義する.

```
// /app/User.php

<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';

    protected $guarded = ['id'];

}
```

Laravelの命名ルールに従っていれば, あえてここでテーブルを指定する必要はない.  
私は自分が分かりやすいように定義している.

`$guarded` で指定したのは `id`.  
PKとして用いられている `id` は, DBの構造上オートインクリメントされる.

```
mysql> desc users;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int(11)      | NO   | PRI | NULL    | auto_increment |
| name       | varchar(255) | NO   |     | NULL    |                |
| created_at | datetime     | YES  |     | NULL    |                |
| updated_at | datetime     | YES  |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
```

つまり, `id` はユーザが指定せずとも自動で決まるということ.  
だから, 複数代入の禁止項目として指定した.

### `IndexController.php` に `create()` を記述

```
// /app/Http/Controllers/IndexController.php

  public function getIndex() {

    // define params
    $name = 'tstTakemoto'; // たけもと
    $data = [
      'name' => $name
    ];

    // save into tstDB.users
    $cli_user = new User;
    $cli = $cli_user->create($data);

    var_dump($cli->toArray());exit;// ブラウザで確認するために
  }
```

わざわざ `$data` を配列にしている理由は, `create()` が引数として配列型しか認めていないから.

`var_dump()` をしているのはブラウザで確認したいから.

### ブラウザとDBで確認

まずはブラウザでの表示.

```
array (size=4)
  'name' => string 'tstTakemoto' (length=11)
  'updated_at' => string '2017-07-26 01:40:29' (length=19)
  'created_at' => string '2017-07-26 01:40:29' (length=19)
  'id' => int 3
```

ポイントは次の通り.

- 格納したレコードがインスタンスに格納される
- `created_at`, `updated_at` が自動で更新される

次にDB.  
次のコマンドで格納されたレコードを確認する.

- `$ select * from users;`

```
mysql> select * from users;
+----+-------------+---------------------+---------------------+
| id | name        | created_at          | updated_at          |
+----+-------------+---------------------+---------------------+
|  1 | tstTakimoto | 2017-07-24 02:10:35 | 2017-07-24 02:10:35 |
|  2 | tstTakumoto | 2017-07-24 02:15:09 | 2017-07-24 02:15:09 |
|  3 | tstTakemoto | 2017-07-26 01:40:29 | 2017-07-26 01:40:29 |
+----+-------------+---------------------+---------------------+
```

## `insert()`

ここまではインスタンス化したモデルのメソッドを利用してきた.  
今回はクエリビルダを使用してレコードを追加してみる.

概要は次の通り.

- `insert()` を使うメリット
- 実際に使ってみる

### `insert()` を使うメリット

個人的に, `insert()` を使うメリットは次の1点だと思っている.

- 複数レコードを一気に格納可能

> 配列の配列をinsertに渡して呼び出すことで、テーブルにたくさんのレコードを一度にまとめて挿入できます。
>
> -- [Laravel 5.3 データベース：クエリビルダ | readouble.com](https://readouble.com/laravel/5.3/ja/queries.html)

使用例は次の通り.  
↑ココと同じページから引用.

```
DB::table('users')->insert([
  ['email' => 'taylor@example.com', 'votes' => 0],
  ['email' => 'dayle@example.com', 'votes' => 0]
]);
```

こんな具合に, 格納したいデータを配列でまとめて一気にテーブルに格納可能.

`save()`, `create()` で複数データをテーブルに格納する場合, `foreach()` 等で繰り返し処理をする必要がある.

動作速度的にどちらに軍配があがるのかは調査していないが, 時間があるときに試してみようと思う.

### 実際に使ってみる

3レコードを一気に格納してみる.  
クエリビルダを利用するには次の一文をコントローラ先頭に記述する必要がある.

- `use Illuminate\Support\Facades\DB;`

コードは次の通り.

```
// /app/Http/Controllers/IndexController.php

<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;// クエリビルダを利用するにはこれが必要
use Illuminate\Http\Request;

use \App\User;// access Model


class IndexController extends Controller
{

  public function getIndex() {

    // define params
    $name_01 = 'tstTakomoto'; // たけもと
    $name_02 = 'tstTakimato'; // たきまと
    $name_03 = 'tstTakimito'; // たきみと
    $datum = [
      'name' => $name_01,
      'name' => $name_02,
      'name' => $name_03
    ];

    // save into tstDB.users
    $cli = DB::table('users')
            -> insert($datum);

    var_dump($cli);exit;
  }

}
```

実行結果 (ブラウザ)

`true`

無事にデータが格納されれば `true` が返ってくる.  
DB格納の成功・失敗で条件分岐させたい時に便利そう.

次に, DBを直接確認する.

実行結果(DB)

- `$ select * from users;`

```
mysql> select * from users;
+----+-------------+---------------------+---------------------+
| id | name        | created_at          | updated_at          |
+----+-------------+---------------------+---------------------+
|  1 | tstTakimoto | 2017-07-24 02:10:35 | 2017-07-24 02:10:35 |
|  2 | tstTakumoto | 2017-07-24 02:15:09 | 2017-07-24 02:15:09 |
|  3 | tstTakemoto | 2017-07-26 01:40:29 | 2017-07-26 01:40:29 |
|  4 | tstTakimito | NULL                | NULL                |
|  5 | tstTakimito | NULL                | NULL                |
+----+-------------+---------------------+---------------------+
```

ここでのポイントは次の通り.

- `insert()` だと `created_at`, `updated_at()` が **自動挿入されない**

だから, もし複数レコードを一気に挿入するために `insert()` を利用するのなら, 日付データも一緒に格納する必要がある.

Laravelを使っているなら `Carbon` というライブラリを使うと便利.  
ここでは `Carbon` を利用しつつ, `insert()` してみる.

### `Carbon` を使って `insert()` してみる

`Carbon` は日付関連操作を便利にしてくれるパッケージのこと.  
PHPのDateTimeクラスを拡張して作られているのが特徴.

使い方は次の通り.

1. `use Carbon\Carbon;` をコントローラ先頭に記述
2. `Carbon::メソッド` という感じで使う

静的メソッド的に呼び出すか, インスタンス化するかはケースバイケース.  
今回は静的メソッド的に `Carbon` を呼び出してみる.

```
// /app/Http/Controllers/IndexController.php

<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;// クエリビルダを利用するにはこれが必要
use Illuminate\Http\Request;
use Carbon\Carbon; // 日付関連操作に

use \App\User;// access Model


class IndexController extends Controller
{

  public function getIndex() {

    // define params
    $name_01 = 'tstTakimuto'; // たけむと
    $name_02 = 'tstTakimeto'; // たきめと
    $name_03 = 'tstTakimota'; // たきもた
    $now = Carbon::now();// 2017-07-26 02:11:22

    $datum = [
      ['name' => $name_01, 'created_at' => $now, 'updated_at' => $now],
      ['name' => $name_02, 'created_at' => $now, 'updated_at' => $now],
      ['name' => $name_03, 'created_at' => $now, 'updated_at' => $now]
    ];

    // save into tstDB.users
    $cli = DB::table('users')
            -> insert($datum);

    var_dump($cli);exit;
  }

}
```

実行結果 (ブラウザ)

`true`

実行結果 (DB)

```
mysql> select * from users;
+----+-------------+---------------------+---------------------+
| id | name        | created_at          | updated_at          |
+----+-------------+---------------------+---------------------+
|  1 | tstTakimoto | 2017-07-24 02:10:35 | 2017-07-24 02:10:35 |
|  2 | tstTakumoto | 2017-07-24 02:15:09 | 2017-07-24 02:15:09 |
|  3 | tstTakemoto | 2017-07-26 01:40:29 | 2017-07-26 01:40:29 |
|  4 | tstTakimito | NULL                | NULL                |
|  5 | tstTakimito | NULL                | NULL                |
|  6 | tstTakimuto | 2017-07-26 02:22:47 | 2017-07-26 02:22:47 |
|  7 | tstTakimeto | 2017-07-26 02:22:47 | 2017-07-26 02:22:47 |
|  8 | tstTakimota | 2017-07-26 02:22:47 | 2017-07-26 02:22:47 |
+----+-------------+---------------------+---------------------+
```

今度はちゃんと日付も格納された.

`Carbon` を利用する際の注意点は次の通り.

- DBのタイムゾーンに合わせる

今回はデフォルトの `UTC` で日付を扱っている.  
自分の環境に合わせて時刻を合わせよう.

長くなったけど, 今回は以上.
