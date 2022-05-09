---
title: 'Wedge Mobile Keyboard U6R-00022のFnキーで悩んだときの解決方法'
tags: ['keyboard']
created_at: '2016-03-20'
updated_at: ''
---

先日購入したキーボードをもっと使いやすくしたい.

- Bluetooth Wedge Mobile Keyboard U6R-00022
    - Fn キーを動作させるために `左下Fnキー` + `F1 - F12` の同時押しが必要

解決策を探したところ, 組み込みスクリプトを公開してくれた方を発見したので紹介する.

## 参考

- [Microsoft Wedge Mobile Keyboard のＦキーをFnキー無しで動作させる | 新たなるエクスペリエンス](http://zze128.blog9.fc2.com/blog-entry-403.html)
- [AutoHotkey Wiki](http://ahkwiki.net/Top)

## 現象

先日購入した下記キーボードで `Fn キー` を使うには, `Fn + function キー` 同時押しが必須.

- Bluetooth Wedge Mobile Keyboard U6R-00022

これはちょっと不便.  
たとえば, `Alt` と同時押しで使う頻度が高い場合とか.

私は Fn キーをこんな感じで使っている.

- `F2`: ファイル名編集
- `F4`: `Alt + F4` でファイルを閉じる
- `F5`: 更新
- `F7`: カタカナ変換
- `F10`: `Shift + F10` で右クリ動作

## 解決方法

下記 2ZZ氏 のスクリプトを利用する.  
`exe` もあるようです.

[Microsoft Wedge Mobile Keyboard のＦキーをFnキー無しで動作させる | 新たなるエクスペリエンス](http://zze128.blog9.fc2.com/blog-entry-403.html)    

## 動作環境

私の動作環境は次の通り.

- TOSHIBA kira v63 windows8.1 64bit    

## AutoHotKey インストール

![AutoHotKey](/images/pages/posts/20160320/160320_autoHotKey.png)

まずは AutoHotKey をインストール.  
AutoHotKey について ↓

> AutoHotkey (AHK) is a free, open-source macro-creation and automation software for Windows that allows users to automate repetitive tasks.  
> It is driven by a scripting language that was initially aimed at providing keyboard shortcuts, otherwise known as hotkeys, that over time evolved into a full-fledged scripting language.
>
> -- [AutoHotkey](https://autohotkey.com/)

早速 DL.

![AutoHotKey ダウンロード](/images/pages/posts/20160320/160320_DL_autoHotKey.png) [AutoHotkey Downloads | AutoHotKey](https://autohotkey.com/download/)

私の pc は 64bit なので `Unicode 64-bit` を選択した.  
バージョンは `v1.1.23.03` (2016-03-20 現在)

## AutoHotKey 実行

`exe` を実行したら次のエラー.

![AutoHotKey 実行](/images/pages/posts/20160320/160320_do_autoHotKey.png)

ファイルがないよ！ と怒られた.  
これは [2ZZ氏 のHP](http://zze128.blog9.fc2.com/blog-entry-403.html) にも注意書きがある.

先述の通り, AutoHotKey はスクリプトを書いてキーボードの動作をコントロールするもの.  
スクリプトを書くためのファイルを作成する必要がある.

ファイルの作成場所はここ.

- `C:\\Users\\○○(自分のPC名)\\Documents`

ファイル名は `AutoHotKey.ahk` にする.

![AutoHotKey ahk](/images/pages/posts/20160320/160320_CreateAhk_autoHotKey.png)

作成したファイルをメモ帳で開く.

[2ZZ氏 のHP](http://zze128.blog9.fc2.com/blog-entry-403.html) から自分の好みのスクリプトを選択してコピペする.  
私はカスタマイズしたかったのでカスタム版をコピペした.

`.ahk` ファイルはこのプログラムでしか使わないはず.  
既定のプログラムに設定する.

1. `AutoHotKey.ahk` で右クリック
2. プログラムから開く
3. 既定のプログラムの選択
4. `AutoHotKey Unicode 64-bit` を選択

![AutoHotKey 既定](/images/pages/posts/20160320/160320_ordinary_autoHotKey.png)

この時点で `F1 - F9` は期待通りの動作をしている.

私は `F9` を `PrtScn` として使いたいので, 引き続き編集する.

## F9を設定

スクリプト編集の際, 下記サイトを参考にした.

[AutoHotkey Wiki](http://ahkwiki.net/Top)

スクリプトの書き方をさらっと学習.

カスタム版スクリプトの `F9` を `F10 - F12` と同じ扱いにしたいから IF文 に取り込む.  
2ZZ 氏のスクリプトをベースに2箇所変える.

元の `F9` の記述は 削除 or コメントアウト する.

```
#If varMode = 0		;通常版・カスタム版の制御
PrintScreen::F9
Home::F10
End::F11
PgUp::F12
#If
```

## スタートアップに登録

`AutoHotKey.exe` を実行しない限り先程の設定は有効化されなり.  
つまり, 再起動するとこの設定は無効化されてしまう.

毎回PC立ち上げ時に `exe` をダブルクリックするのは手間だからスタートアップに登録する.  
次の場所に `AutoHotKey.exe` のショートカットを設置する.

- `C:\\Users\\○○(自分のPC名)\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`

これで再起動しても自動的に設定が反映される.

## 機能をOFFする方法

たとえばカフェで作業をするときはノートPC自体のキーボードを使うと思います。  
ノートPCのキーボードは大抵F1 - F12は独立しているのでAutoHotKeyは不要なはず。  
そんなときは、次の方法で機能をOFFしましょう。

![タスクマネージャ](/images/pages/posts/20160320/fd64a7992408252c6a67d61d4f47caa8.png)

1. ~~画面下タスクバーで右クリック~~
2. ~~タスクマネージャ~~
3. ~~プロセス タブ~~
4. ~~AutoHotKey を選択~~
5. ~~タスクの終了~~

-- 160731 追記  
2ZZ 氏 から終了方法についてコメント欄からご指摘頂きました.  
終了は次の手順がオススメです.

![autoHotKey Exit](/images/pages/posts/20160320/160731_autoHotKey.png)

1. タスクバー
2. `AutoHotKey.ahk` アイコンを右クリック
3. `Exit`

-- 追記終わり

## まとめ

これで私のキーボードに関するストレスが解消した.  

凄いよね、はてなの住人の方々.  
AutoHotKeyでググるとはてなの方々が沢山ヒットします. 実力者が多いイメージ.

今回のスクリプトはfc2の 2ZZ 氏のモノです. 助かりました. この場で御礼を申し上げます.  
ありがとうございました。

将来的には私もハードを動かせるようになりたいな.  
今回の AutoHotKey も余裕があればカスタマイズしたい.  
でもまずは目の前の開発に専念しないと. 2016年中には WEB サービスをリリースしたいので.

今回は以上.

