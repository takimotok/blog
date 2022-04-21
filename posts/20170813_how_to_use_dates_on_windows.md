---
title: 'コマンドプロンプト 日付の操作方法'
tags: ['windows']
created_at: '2017-08-13'
---

バッチファイル作成時に日付を扱うことになった.  
ここでは日付・時刻の基本的な使い方を紹介.

概要は次の通り.

## 動作環境

- windows10 Home x64

## 前提条件

本記事では次の方針で日付・時刻の取り扱い方法を紹介する.

- 環境変数に格納されている値の文字列操作を行う

詳しくは次のコマンドでヘルプを見てみるとよい.

- `set /?`

## 年月日

年月日は次のコマンドで表示可能.

- `%date%`

```sh
C:\>echo %date%
2017/08/13
```

## 時刻

時刻は次のコマンドで表示可能.

- `%time%`

```sh
C:\>echo %time%
11:15:09.30
```

## 日付・時刻中の任意の文字列を取得

日付・時刻を扱うときは, 次のような処理をしたい場合が多い.

- 年 だけ抽出して演算
- 月 だけ抽出して演算
- 日 だけ抽出して演算
- 時間 だけ抽出して演算
- 分 だけ抽出して演算
- 秒 だけ抽出して演算

ここでは, ひとまず抽出する方法を紹介.  
概要は次の通り.

- 抽出のためのコマンド
- さっそくやってみる

### 抽出のためのコマンド

次のコマンドで任意の位置から文字列の抽出が可能.

- `%変数名:~m,n%`

| 項目 | 意味 |
| :-- | :-- |
| 変数名 | 自分で設定した変数名.  
`set` `setlocal` とかで指定 |
| `~` | 抽出の時にとりあえず必要 |
| `m` | 開始位置. **0はじまり**. |
| `n` | 終了位置 |

`m` はゼロ番目から数え始める.  
注意しよう.

### さっそくやってみる

今回はbatch fileじゃなく, コマンドプロンプトに直書きしてみる.  
やることは次の通り.

- 年 だけ抽出
- 月 だけ抽出
- 日 だけ抽出
- 時間 だけ抽出
- 分 だけ抽出
- 秒 だけ抽出

#### 年 だけ抽出

```sh
set TODAY=%date%_%time%
set YEAR=%TODAY:~0,4%

echo %TODAY%
echo %YEAR%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set YEAR=%TODAY:~0,4%

C:\>
C:\>echo %TODAY%
2017/08/13_11:28:37.62

C:\>echo %YEAR%
2017
```

#### 月 だけ抽出

```sh
set TODAY=%date%_%time%
set MONTH=%TODAY:~5,2%

echo %TODAY%
echo %MONTH%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set MONTH=%TODAY:~5,2%

C:\>echo %TODAY%
2017/08/13_11:30:01.71

C:\>echo %MONTH%
08
```

#### 日 だけ抽出

```sh
set TODAY=%date%_%time%
set DAY=%TODAY:~8,2%

echo %TODAY%
echo %DAY%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set DAY=%TODAY:~8,2%

C:\>echo %TODAY%
2017/08/13_11:31:17.26

C:\>echo %DAY%
13
```

#### 時間 だけ抽出

```sh
set TODAY=%date%_%time%
set HOUR=%TODAY:~11,2%

echo %TODAY%
echo %HOUR%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set HOUR=%TODAY:~11,2%

C:\>echo %TODAY%
2017/08/13_11:32:04.99

C:\>echo %HOUR%
11
```

#### 分 だけ抽出

```sh
set TODAY=%date%_%time%
set MINIT=%TODAY:~14,2%

echo %TODAY%
echo %MINIT%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set MINIT=%TODAY:~14,2%

C:\>echo %TODAY%
2017/08/13_11:32:56.51

C:\>echo %MINIT%
32
```

#### 秒 だけ抽出

```sh
set TODAY=%date%_%time%
set SECOND=%TODAY:~17,2%

echo %TODAY%
echo %SECOND%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set SECOND=%TODAY:~17,2%

C:\>echo %TODAY%
2017/08/13_11:33:48.09

C:\>echo %SECOND%
48
```

#### 秒を後ろから指定して抽出する

分, 秒 を抽出するのなら次の技を使うと良い.

- 文字列の後ろから m番目 を指定

「後ろから」は `-(マイナス)` で表現する.  
たとえば 秒を指定するならこんな感じ↓

```sh
set TODAY=%date%_%time%
set SECOND=%TODAY:~-5,2%

echo %TODAY%
echo %SECOND%
```

実行結果

```sh
C:\>set TODAY=%date%_%time%

C:\>set SECOND=%TODAY:~-5,2%

C:\>echo %TODAY%
2017/08/13_11:44:19.18

C:\>echo %SECOND%
19
```

後ろから数える時は **1番目** から数え始めるっぽい.  
これは先頭から数え始める場合と異なるので注意.

今回は以上.
