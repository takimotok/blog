---
title: 'Google Places APIの基礎'
tags: ['api', 'google']
created_at: '2017-06-06'
---

Google Places APIが自分の目的に適うかを知りたかったので技術検証.  
そもそも Google Places API ってなに？ からスタート.

最終目標は東京都内のカフェ情報取得.

概要は次の通り.

## 参考

- 公式ドキュメント :Google Places API Web Service
    - https://developers.google.com/places/web-service/intro?hl=ja

## 動作環境

- PHP 5.6
- Laravel5.3

### 前提条件

APIキーは取得済みとする.  
まだ取得していない場合は次のurlから取得する.

- [API キーを取得する](https://developers.google.com/places/web-service/get-api-key?hl=ja)

今回はLaravelの `.env` を利用したけど, 直接ソースコードに必要情報を書いても結果は変わらない.

## GooglePlacesAPI とは

そもそも GooglePlacesAPI とは？ について。

> Google Places API Web Service は、この API 内で施設、地理的位置、有名なスポットとして定義されているプレイスについての情報を HTTP リクエストを使用して返すサービスです。
>
> 各サービスに HTTP リクエストとしてアクセスすると、JSON または XML レスポンスが返されます。プレイス サービスへのリクエストではすべて https:// プロトコルを使用し、API キーを含めてください。
>
> -- [Google Places API Web Service | developers.google.com](https://developers.google.com/places/web-service/intro?hl=ja)

つまりこういうこと↓

- HTTPリクエストを送れば
- 周辺施設の情報をjsonで返してくれる

## 使ってみる

APIキーは取得済みとする.

今回はPHPのcurlでHTTPリクエストを投げてみる.  
気付いた点はコード内にコメントとして記載した.

```php
<?php

// Google Places API を cURL でリクエスト
$baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/";
$fileType = "json";
$query    = [
  "location" =>  "35.66,139.69", // 東京の緯度経度
  "radius"   =>  500, // 半径 500m
  "type"     =>  "cafe", // これは決められた範囲で選択可能
  "key"      =>  env('GOOGLE_PLACES_API_KEY', false) // .envに書き込んだkeyをread
];

$query = http_build_query($query);
$url   = $baseUrl.$fileType.'?'.$query;


// fire
$curl = curl_init($url);
$options = [
  CURLOPT_HTTPGET => true,//GET
  CURLOPT_RETURNTRANSFER => true // fetch datum as strings
];

curl_setopt_array($curl, $options);
$result = curl_exec($curl);
curl_close ($curl);


// save datum
$fPath = "./";
$fName = "/tmp.json";
$file = fopen($fPath.$fName, "w+");// 上書き/新規作成
fputs($file, $result);
fclose($file);

?>
```

### コード解説

このコードだと取得した情報の一部が文字化けする.  
適宜jsonエンコードのオプションを弄ろう.

HTTPリクエスト先をどのようなルールで作成するのかは公式マニュアルにある通り.  
ここでは次の点について解説.

- url作成方法
- queryパラメータの `type` について

#### url作成方法

今回は公式ドキュメントにある 「周辺検索リクエスト」 という方法を用いた.  
url作成に関する公式ドキュメントはこちら.

- [周辺検索リクエスト | developers.google.com](https://developers.google.com/places/web-service/search?hl=ja)

> 周辺検索リクエストは、次の形式の HTTP URL です。
>
> -- https://maps.googleapis.com/maps/api/place/nearbysearch/output?parameters

`output`, `parameters` はこちらで作る必要がある.

- `output` :どの形式でデータを受け取るか. 次のいずれかを指定.
    - json
    - xml
- `parameters` :必須パラメータは次の通り
    - `key` :APIキー
    - `location` :緯度、経度 の形式で指定
    - `radius` :検索結果を返す場所の範囲

APIキーはGoogleDeveloperConsoleで取得・作成したもの.

以上を踏まえて作成したurlは次の通り.

```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=35.66%2C139.69&radius=500&type=cafe&key=APIキー
```

#### queryパラメータの `type` について

これは必須パラメータじゃないけど, cafeに関連する施設の検索が目的だったので指定した.

typeに関する公式ドキュメントはこちら.

- [プレイスタイプ | developers.google.com](https://developers.google.com/places/supported_types?hl=ja)

ドキュメントを眺めると色々と選択できる.  
今回はこの中でも `cafe` を選択した.

## 取得したjsonの中身を眺めてみる

取得したjsonの中身を眺めてみる.

実は取得情報についても公式ドキュメントで確認可能.  
必要に応じて公式ドキュメントを参照して欲しい.

- [プレイス検索結果 | developers.google.com](https://developers.google.com/maps/documentation/javascript/places?hl=ja)

取得したjsonの情報を一部書き換えたものはこちら.

```json
{
   "html_attributions" : [],
   "next_page_token" : "xxx", // 長い文字列がここに入ってる
   "results" : [ // ヒットした結果が複数ある場合, ここに配列として格納される
      {
         "geometry" : {
            "location" : {
               "lat" : 000,
               "lng" : 000
            },
            "viewport" : {
               "northeast" : {
                  "lat" : 000,
                  "lng" : 000
               },
               "southwest" : {
                  "lat" : 000,
                  "lng" : 000
               }
            }
         },
         "icon" : "店舗画像.png",
         "id" : "店舗id",
         "name" : "店舗名",
         "opening_hours" : {
            "open_now" : true,
            "weekday_text" : []
         },
         "photos" : [
            {
               "height" : 000,
               "html_attributions" : [
                  "000xxx"
               ],
               "photo_reference" : "000xxx",
               "width" : 000
            }
         ],
         "place_id" : "xxx",
         "rating" : 000,
         "reference" : "xxx",
         "scope" : "GOOGLE",
         "types" : [ "cafe", "bar", "food", "point_of_interest", "establishment" ],
         "vicinity" : "住所"
      },
      {
        // 繰り返し
      }
  ]
}
```

今回取得した情報と公式ドキュメントを見比べて気になる情報を解説.  
「気になる」基準は, 今後GoogleMapsApiと連携する上で必要かどうか.

概要は次の通り.

- next\_page\_token
- id
- place\_id
- reference
- vicinity

以下, 詳細.

### next\_page\_token

1回のリクエストで得られる情報は最大で 60/件.  
リクエストにヒットする情報がこれより多い場合は, 追加でリクエストすれば取得可能.  
その時に利用するのが `next_page_token` らしい.

> next\_page\_token にはトークンが含まれ、このトークンを使って最大 20 件の追加結果を返すことができます。  
> 表示する追加結果がない場合は、next\_page\_token は返されません。  
> 返すことができる検索結果の最大数は 60 です。  
> next\_page\_token が発行されてから有効になるまでに少し時間がかかります。

### id

このidは気にしなくてok.  
理由は次の通り.

> place\_id の導入により、id は廃止されました。

### place\_id

Google Map で場所を検索すると, 何かしらヒットする.  
このとき, ヒットした場所一つ一つにidが割り当てられている.  
そのidが `place_id`.

`place_id` を利用すれば, Google Map上で一意に場所・施設の特定が可能.

> プレイスを一意に識別するテキスト表記の ID です。

### reference

これも気にしなくてok.

> place\_id の導入により、reference は廃止されました。

### vicinity

ドキュメントの説明は次の通り.

> 周辺の場所の対象物名が含まれます

つまり, 場所がオブジェクト毎に格納されるってことかな?  
今回のHTTPリクエストで取得した`vicnity`は次の通り.

`"vicinity" : "目黒区 ３丁目６−９ cityroadB1"`

現時点では使いどころが思い浮かばないけど, そういうものだと理解しておく.  
いつかきっとこの記事を読んでくれた詳しい方が, この点についてコメントをくれるはず.

もしくは私が更に調査を進めて詳しくなるか.

どちらが先になるか分からないけど, 今回は以上.
