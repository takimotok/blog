---
title: 'laravel migrationでcolumn変更'
tags: ['laravel']
created_at: '2018-05-05'
updated_at: ''
---

Laravelでは、デフォルトのままではカラム変更のマイグレーションは行えない.  
`doctrine/dbal` を composer経由で入手する必要がある.

作業手順をメモ.

## 動作環境

- laravel 5.5
- php 7.2
- composer 1.5.2

## 作業概要

今回は例として次のような変更を行う.

- `DB.menus.menu` の
  - 型 変更
    - `int(10)` -> `varchar(50)`
  - カラム名 変更
    - `menu` -> `name`

## doctrine/dbal インストール

Laravelでは、デフォルトのままではカラム変更のマイグレーションは行えない.  
`doctrine/dbal` を composer経由で入手する必要がある.

`doctrine/dbal` をインストール.

```sh
$ composer require doctrine/dbal

Using version ^2.5 for doctrine/dbal
./composer.json has been updated
Loading composer repositories with package information
Updating dependencies (including require-dev)
Package operations: 0 installs, 1 update, 0 removals
  - Updating doctrine/dbal (v2.5.12 => v2.5.13): Downloading (100%)
Writing lock file
Generating autoload files
> Illuminate\Foundation\ComposerScripts::postUpdate
> php artisan optimize
  Generating optimized class loader
The compiled class file has been removed.
```

これで `doctrine/dbal` インストールは完了.

## カラム名 変更

まずはカラム名を変更する.

menusテーブルの現状のschemaはこんな感じ.

```sql
mysql> show create table menus\G
*************************** 1. row ***************************
       Table: menus
Create Table: CREATE TABLE `menus` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `menu` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)
```

schemaを変えたいときは毎回migrationファイルを生成する.  
migrationファイル生成.

```sh
$ php artisan make:migration alter_column_name_from_menu_to_name_menus_table --table=menus
  Created Migration: 2018_04_08_085803_alter_column_name_from_menu_to_name_menus_table
```

今回の編集のポイントは `renameColumn()` を使うこと.

編集後のファイルはこんな感じ↓

```php
// 2018_04_08_085803_alter_column_name_from_menu_to_name_menus_table

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterColumnNameFromMenuToNameMenusTable extends Migration
{
    public function up()
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->renameColumn('menu', 'name');
        });
    }

    public function down()
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->renameColumn('name', 'menu');
        });
    }
}
```

編集は一旦ここまで.

いざ, migration実行.

```sh
$ php artisan migrate
  Migrated: 2018_04_08_085803_alter_column_name_from_menu_to_name_menus_table
```

できたっぽい.  
DB確認.

```sql
show create table menus\G
*************************** 1. row ***************************
       Table: menus
Create Table: CREATE TABLE `menus` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)
```

カラム名変更は以上で完了.

## 型 変更

次は `name` カラムの型を変更.  
再度migrationFile作って同様に処理.

`$ php artisan make:migration change_column_menus_table --table=menus`

ファイル編集.  
ここでのポイントは `change()` を使うこと.

```php
// database\migrations\2018_04_09_155038_change_column_menus_table.php

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeColumnMenusTable extends Migration
{
    public function up()
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('name', 50)->default(NULL)->change();
        });
    }

    public function down()
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->unsignedInteger('name')->change();
        });
    }
}
```

migration実行.

`$ php artisan migrate`

DB確認.

```sql
show create table menus\G
*************************** 1. row ***************************
       Table: menus
Create Table: CREATE TABLE `menus` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
1 row in set (0.00 sec)
```

ok.

今回は以上.
