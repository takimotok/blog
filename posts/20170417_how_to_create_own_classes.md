---
title: 'Laravel5.3 自作class使用方法'
tags: ['laravel']
created_at: '2017-04-17'
---

ローカル開発環境で自作classの作成・呼び出しを行いたい.  
cakePHPなら命名規則やディレクトリ構造が厳密に規定されているが, Laravelだとどうなんだろう?

今回は次の点を主に調査した.

- どのディレクトリに作成するか
- 呼び出し方

今回のゴールは, Controllerから自作クラスを呼び出すこと.

概要は次の通り.

## 動作環境

- Laravel 5.3
- centOS 6.8

## どのディレクトリに作成するか

**Laravelでは自作クラス置き場は存在しない.**  
だから, 今回は任意の場所に自作クラスを作成すればok.

今回は次の場所に自作クラスを作成する.

- /app/Libs

Libディレクトリは自分で作成.  
このディレクトリ配下に次のファイルを作成する.

- tmpMyClass.php

```php
<?php

// tmpMyClass.php

namespace App\Libs;

class tmpMyClass
{
    public function echoHello() 
    {
        echo "Hello";
    }
}
```

## 呼び出し方

自作クラスの呼び出し方は大きく2通りの方法がある.

- 名前空間の利用
- Laravelのファサードを利用

後者のファサードの利用は, サービスプロバイダへの登録や依存注入の理解が大変そう.  
だから, 前者の名前空間を利用して呼び出すことにする.

呼び出す時は `new` で呼び出す.

手順は次の通り.

1. ルーティング設定
2. コントローラ設定
3. 実行

今回は TestsController を作成して動作確認を行う.

### ルーティング設定

次のファイルを編集する.

```php
// \routes\web.php  

Route::get('tests', 'TestsController@index');
```

`/test` にgetアクセスしたら, TestsControllerの `index` アクションが動作するように設定.

### コントローラ設定

次のファイルを編集.

```php
<?php

// \app\Http\Controllers\TestsController.php

namespace App\Http\Controllers;

use \App\Libs\tmpMyClass;


class TestsController extends Controller
{
  public function index(){
      $helloInstance = new tmpMyClass;
      var_dump($helloInstance->echoHello());
  }
}
```

`new` でインスタンス化.  
生成したインスタンスから `echoHello()` メソッドを呼び出す.

### 実行

ブラウザで表示確認.

ルーティングで設定したアドレスへアクセス.  
今回は `http://ホスト名/tests`

結果.

```
Hello
```

自作class 動作確認完了.

今回は以上.
