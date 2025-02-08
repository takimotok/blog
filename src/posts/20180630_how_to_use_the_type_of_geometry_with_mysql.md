---
title: 'MySQL geometry型の基礎'
tags: ['mysql']
created_at: '2018-06-30'
updated_at: ''
---

MySQLで位置情報(latitude, longitude)を扱いたい.  
でも, ググるといろんな人がいろんなデータ型で位置情報を扱っている.

そんな中, geometry型というものを知った.  
geometry型についてよくわからなかったので, 公式マニュファルを基に簡単にまとめてゆく.

## 方針

本記事の方針は次の通り.

- MySQL リファレンスマニュアルを自分なりに読み解く & まとめる
- 不明点は都度ググる & まとめる
- 次の視点でまとめる
  - 緯度経度の場合はどうなの？
  - InnoDBの場合はどうなの？

v 5.7から InnoDBでも空間データ型が扱えるようになった.  
この点は後述する.

## 参考

主な参考サイトは次の通り.

- [第 11 章 データ型 verson 5.6| dev.mysql.com](https://dev.mysql.com/doc/refman/5.6/ja/data-types.html)
- [Chapter 11 Data Types version 5.7](https://dev.mysql.com/doc/refman/5.7/en/data-types.html)

日本語版だと ~5.6 までしかない.  
私の動作環境は 5.7.22 なので, 基本的には英語の方を読んでゆく.  
必要に応じて日本語版も参照する.

## 動作環境

- MySQL 5.7.22
  - InnoDB

## そもそもMySQLにはどんなデータ型があるの?

リファレンスマニュアルを眺めると, データ型についてまとまっている章がある.

> 11.1 Data Type Overview  
> 11.2 Numeric Types  
> 11.3 Date and Time Types  
> 11.4 String Types  
> 11.5 Spatial Data Types  
> 11.6 The JSON Data Type  
> 11.7 Data Type Default Values  
> 11.8 Data Type Storage Requirements  
> 11.9 Choosing the Right Type for a Column  
> 11.10 Using Data Types from Other Database Engines
>
> -- [Chapter 11 Data Types](https://dev.mysql.com/doc/refman/5.7/en/data-types.html)

空間データを扱う型があるね.  
たぶんこれが位置情報を扱うのに適している (はず).

なので, 次の箇所を中心に眺めてゆく.

> 11.5 Spatial Data Types

v 5.6 の日本語版マニュアルも見たけど, 内容は概ね一緒.  
v.5.7 の英語版と交互に見てゆく.

## リファレンスを読み進めるための 概念 & 用語

初見だと理解しにくかったり, 知らないとリファレンスを読み進めることができない概念や用語が多い.  
簡単にまとめる.

### OGC

MySQL リファレンスマニュアルを眺めていると頻繁に OGC という単語が出てくる.

> The Open Geospatial Consortium (OGC) is an international consortium of more than 250 companies,  
> agencies, and universities participating in the development of publicly available conceptual solutions  
> that can be useful with all kinds of applications that manage spatial data.
>
> -- [11.5 Spatial Data Types](https://dev.mysql.com/doc/refman/5.7/en/spatial-types.html)

私の理解はこんな感じ↓

- `OGC`: RDBMSで位置情報をよしなに扱うための概念や手法等の牽引をしてくれている国際的な組織

MySQLにおける空間データの取扱は, OGCの仕様に沿っているっぽい.

### OpenGIS

- OGCが発行している仕様書
- 入手場所
  - [OpenGIS Implementation Specification for Geographic information - Simple feature access - Part 2: SQL option](http://www.opengeospatial.org/standards/sfs)

### InnoDBでも空間インデックスが貼れる

> For indexing spatial columns, MyISAM and InnoDB support both SPATIAL and non-SPATIAL indexes.
>
> -- [11.5 Spatial Data Types](https://dev.mysql.com/doc/refman/5.7/en/spatial-types.html)

~ v 5.6 だと MyISAM のみだった.  
v 5.7 では InnoDB でも空間インデックスが貼れる.

### 地理的特性

空間データとして次のようなものを扱えるよ, という説明.

次のようなものを 地理的特性 と呼ぶらしい.

- 山, 池, 都市
- 領域, 町の区域
- 定義可能な位置

位置情報は latitude, longitude が分かれば特定の1点が定義可能.  
だから地理的特性だと言えそう.

### 次の言葉の意味は全部一緒

マニュアル内では次の用語は全部同じ意味として捉えている.

- 地理的特性
- 地理空間特性
- 特性
- 幾何図形

地理的特性 と 幾何図形 を同じ意味として捉えちゃうの ???  
と疑問に思ったが, MySQL内部では数学的にデータ処理しているだろうから, 一先ず同じ意味だと思ってマニュアルを読み進める.

### 空間データ型

空間データ型という型がある.  
MySQLの空間データ型の取扱は OpenGIS幾何モデル に基づいているらしい.

緯度経度のデータを扱うときに関係ありそうなデータ型はこのへんかな?

> - GEOMETRY
> - POINT
> - LINESTRING
> - POLYGON

マニュアルには Mylti~ という型も紹介されているが, 今回は一旦無視.  
本記事では GEOMETRY, POINT に絞ってマニュアルを読み進めてゆく.

### OpenGIS 幾何モデル

幾何図形を定義するためのモデルがあるっぽい.

少しググると `GEOMETRY` と `POINT` の違いが分からなくて混乱する.  
マニュアルにはこれらが階層関係だと明記されている.

> The geometry classes define a hierarchy as follows:
>
> - Geometry (noninstantiable)
>   - Point (instantiable)
>   - Curve (noninstantiable)
>     - LineString (instantiable)
>       - Line
>       - LinearRing
>   - Surface (noninstantiable)
>     - Polygon (instantiable)
>   - GeometryCollection (instantiable)
>     - MultiPoint (instantiable)
>     - MultiCurve (noninstantiable)
>       - MultiLineString (instantiable)
>     - MultiSurface (noninstantiable)
>       - MultiPolygon (instantiable)
>
> -- [11.5 Spatial Data Types](https://dev.mysql.com/doc/refman/5.7/en/spatial-types.html)

OOPのクラス設計をイメージすると理解しやすいかも.

- instantiable のみインスタンス化可能
- Geometyは親クラス (abstract)
  - ↑ここにいくつかのサブクラスがぶら下がっている

概念, 用語については以上.  
ここからは次のクラスについて見てゆく.

- Geometry クラス
- Point クラス

## Geometry クラス

abstractクラス.

プロパティーは次の通り.

- type
  - 階層内のインスタンス化可能クラスの内どれか
- SRID
  - 空間参照識別子
  - 幾何値に関連付けられた整数
- coordinates
  - 座標
  - SRIDに対する相対的なもの
- interior, boundary, exterior
  - 占有領域を表す
    - interior: 幾何図形によって占有されている領域
    - boundary: 幾何図形の内部と外部の境界
    - exterior: 幾何図系によって占有されていない領域
- MBR (minimum bounding rectangle)
  - 包絡線, envelope
  - 範囲を規定する幾何図形
  - 最小 および 最大 の (x,y)座標から形成される
- simple / nonsimple
  - 値が simple or nonsimple かを表す
- closed / not closed
  - 値が closed or not closed かを表す
- empty / nonempty
  - 値が empty or nonempty かを表す
    - empty
      - 点を1つも含まない幾何図形のこと
      - 面積が0
- dimension
  - 次元
    - \-1 : 空の幾何図形
    - 0 : 長さ も 面積 も持たない幾何図形
    - 1 : 長さ≠0, 面積=0 の幾何図形
    - 2 : 面積≠0 の幾何図形

まとめたはいいけど, 正直よく分からないプロパティもある.

今回扱いたい座標(latitude, longitude)はこんな感じかな? ↓

- Pointオブジェクト として扱える
- 0次元

Geometry クラス については以上.

## Point クラス

> A Point is a geometry that represents a single location in coordinate space.
>
> -- [11.5.2.3 Point Class](https://dev.mysql.com/doc/refman/5.7/en/gis-class-point.html)

ってことらしい.  
私の理解は次の通り.

- `Point`: x, y の2軸で平面を考えたときのある1点
- x座標, y座標 を1セットとして Point とみなす

今回扱いたい latitude, longitude はこれに該当する.

プロパティは次の通り.

- X-coordinate value.
- Y-coordinate value.
- Point is defined as a zero-dimensional geometry.
- The boundary of a Point is the empty set.

ググってよく見かける `X()`, `Y()` 関数はこれらのプロパティにアクセスするものだったんだね.  
この辺は使いながら覚えていこう.

マニュアルの目次にある `空間データの使用` を見ながらテーブル操作したいが,  
それは別の機会に.

今回は以上.
