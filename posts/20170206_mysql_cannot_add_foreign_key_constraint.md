---
title: 'MySQL Cannot add foreign key constraint で怒られた'
tags: ['mysql']
created_at: '2017-02-06'
---

外部キー設定作業中にハマったのでメモ.  
本記事では外部キーやデバッグの過程についても紹介する.


## 動作環境

- MySQL 5.7.15

### 前提条件

今回は次の2テーブル( `users`, `kinds` )を例に考える.

- DB.users (子テーブル)
    - id
    - kind\_id (外部キー)
- DB.kinds (親テーブル)
    - id (参照されるキー)
    - kind

## 参考

- [15.8.7 InnoDB and FOREIGN KEY Constraints\_MySQL](http://dev.mysql.com/doc/refman/5.7/en/innodb-foreign-key-constraints.html)

## 結論

先に結論から.

今回のエラーは参照元, 参照先のキーの型が異なったために発生したエラー.  
次のコマンドでそれぞれのキーを見比べれば何が違うか一目瞭然.

`show create table テーブル名 \G`

型を揃えたらエラーが解消された.

## 外部キーとは

次のような動作を実現するもの.

- 一方のテーブルに加えた変更が自動的に他テーブルにも反映する
- 外部キーを持つテーブル間に親子関係を定義する

今回の例なら次のように言い換えられる.

- `.users` から見て
- `.kinds` のレコードを特定するためのもの

### 外部キーを使ってできること

たとえば, テーブル設計時にこんな希望がある.

- `DB.users`内の`kind_id`カラムは, `DB.kinds`内の`id`じゃないとダメ
- `DB.kinds`内の`id` を削除したら `DB.users`内の`kind_id` も削除される

`外部キー制約` を利用するとこれらが実現できる.

### 現在のテーブル構造を確認する

一先ず現状のテーブル構造を確認する.  
次のコマンドで

- テーブル名
- フィールド名
- 型

が確認可能.

```sql
mysql> show create table users \G;
mysql> show create table kinds \G;
```

実行結果.  
(外部キー設定前)

```sql
mysql> show create table users \G;
*************************** 1. row ***************************
       Table: users
Create Table: CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kind_id` int(11) DEFAULT NULL,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)

ERROR:
No query specified
```

```
mysql> show create table kinds \G;
*************************** 1. row ***************************
       Table: kinds
Create Table: CREATE TABLE `kinds` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kind` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)

ERROR:
No query specified
```

### 親テーブル, 子テーブル

ここで少し用語について.

外部キーの

- 参照元(親テーブル)
- 参照先(子テーブル)

によってテーブルの呼称が変わるらしい.

今回の例では

- 親テーブル
    - kinds
- 子テーブル
    - users

## 外部キーを使う条件

外部キーを使うためにはいくつか条件がある.

- 親テーブル, 子テーブルそれぞれが `InnoDB` であること
- 外部キーに `Unique` 制約 があること
- 参照元, 参照先のキーの型が同じであること

\*170206 追記 twitterで指摘を頂きました. uniqueにする必要なし

MySQLのストレージエンジンは大きく次の2種類.

- InnoDB
- MyISAM

確認方法は次の通り.  
次の例では `.users` のストレージエンジン等を確認できる.

```
mysql> use information_schema;
mysql> select table_name, engine from tables where table_schema = "users";
```

## 外部キー制約の設定

### 外部キー制約

次の例のように, 複数のテーブルにまたがる値を関連付けたいことがある.

- `DB.users`内の`kind_id`カラムは, `DB.kinds`内の`id`じゃないとダメ

そんなときに外部キー制約を利用すると便利.

### 外部キー制約 設定

制約名(constraint)を指定しないとエラーになる.

```
mysql> ALTER TABLE users ADD FOREIGN KEY(kind_id) REFERENCES kinds(id) ON UPDATE CASCADE ON DELETE SET NULL;
ERROR 1215 (HY000): Cannot add foreign key constraint
```

constraint を指定して外部キーを設定

```
ALTER TABLE users ADD CONSTRAINT users_fk_1 FOREIGN KEY (kind_id) REFERENCES kinds (id) ON UPDATE CASCADE ON DELETE SET NULL;
```

↑このSQL文の意味は次の通り.

- 親テーブル変更: 子テーブルも変更
- 親テーブル削除: 子テーブルに `NULL` を格納

#### 外部キー設定時のオプション

- ON DELETE
- ON UPDATE

には次の4つの値が指定可能.

| 値        | 意味                                                                  |
|:----------|:----------------------------------------------------------------------|
| RESTRICT  | 親テーブルに変更を加えた時にエラーを返す. 子テーブルへの変更はok      |
| NO ACTION | `RESTRICT` と一緒                                                     |
| CASCADE   | 親テーブルの変更がそのまま子テーブルへも反映される.                   |
|           | 親テーブルのデータを削除 -> 子テーブルのデータ(レコード)が削除される. |
|           | 親テーブルのデータ変更 -> 子テーブルのデータも変更される              |
| SET NULL  | 親テーブルの更新・削除 -> 子テーブルへ `NULL` が設定される            |

## Cannot add foreign key constraint で怒られた

エラー内容は次の場所で確認可能.

- `SHOW ENGINE INNODB STATUS;`
    - LATEST FOREIGN KEY ERROR

エラー内容は次の通り.

```
------------------------
LATEST FOREIGN KEY ERROR
------------------------
2017-02-06 02:24:23 0x7f3b91028700 Error in foreign key constraint of table gMapAppDB/#sql-6bc_5:
 FOREIGN KEY(kind_id) REFERENCES kinds(id) ON UPDATE CASCADE ON DELETE SET NULL:
Cannot find an index in the referenced table where the
referenced columns appear as the first columns, or column types
in the table and the referenced table do not match for constraint.
Note that the internal storage type of ENUM and SET changed in
tables created with >= InnoDB-4.1.12, and such columns in old tables
cannot be referenced by such columns in new tables.
Please refer to http://dev.mysql.com/doc/refman/5.7/en/innodb-foreign-key-constraints.html for correct foreign key definition.
```

`.users`, `kinds` の該当フィールドを見比べると型が違う事に気付いた.

| テーブル名 | 該当箇所 |
| :-- | :-- |
| `.users` | `kind_id` int(11) DEFAULT NULL |
| `.kinds` | `id` int(10) unsigned NOT NULL AUTO\_INCREMENT |

子テーブルである `.users` の型に

- `int(10)`
- `unsigned`

を追加する.

```
alter table users change kind_id kind_id int(10) unsigned DEFAULT NULL;
```

外部キーもユニークである必要があるから, `DB.users.kind_id` を`Unique` に設定.

```
alter table users add unique (kind_id);
```

--- 追記  
170206  
twitterで指摘を頂きました. uniqueにする必要なし  
--- 追記 ここまで

変更ができたか確認.

```
mysql> show create table users \G;
*************************** 1. row ***************************
       Table: users
Create Table: CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kind_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kind_id` (`kind_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)

ERROR:
No query specified
```

再チャレンジ

```
ALTER TABLE users ADD CONSTRAINT users_fk_1 FOREIGN KEY(kind_id) REFERENCES kinds(id) ON UPDATE CASCADE ON DELETE SET NULL;
```

できた.  
実行結果.

```
mysql> ALTER TABLE users ADD CONSTRAINT users_fk_1 FOREIGN KEY(kind_id) REFERENCES kinds(id) ON UPDATE CASCADE ON DELETE SET NULL;
Query OK, 1 row affected (0.06 sec)
Records: 1  Duplicates: 0  Warnings: 0
```

## まとめ

親テーブルと子テーブルで外部キー制約を設定する時は型を合わせよう.

今回は以上.
