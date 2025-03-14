---
title: '「はこのマシンでは利用できないため、オブジェクト を読み込めませんでした。」excel 64bitの制限事項'
tags: ['windows', 'vba']
created_at: '2016-03-30'
updated_at: ''
---

今回はマクロが走らなくて困った、という件について.  
原因は excel 64bit の制限事項に引っかかったから.

## 動作環境

動作環境は次の通り.

- windows8.1 64bit
- Office excel 2016 64bit

## マクロを含むexcelを立ち上げたらエラーが出現

![excel 64bit 32bit はこのマシンでは利用できないため](/images/pages/posts/20160330/7090c5a6675bb0b0a946640887777929.png)

.xlsmを立ち上げると上の画像のようなエラーが.

> 「はこのマシンでは利用できないため、オブジェクト を読み込めませんでした。」

参りましたね. 主語がないエラーって.

## excel 64bit は制限事項が多い

解決策を探してみるとあっさり発見.  
ブログ主様, 大変お世話になりました.

> 直接の原因は **ComCtlが64bit版ではサポートされていない** ことです。
>
> -- [「はこのマシンでは利用できないため、オブジェクト を読み込めませんでした。」～64bit版Excelで不可解なエラーに遭遇した | ぼちぼち書くブログ](http://mypace.sasapurin.com/entry/2015/05/26/124400)

とはいえ、そもそもexcel 32bit/64bit の違いはなんなのか知りたい.  
ここでは office 32bit/64bit 版の違いを紹介する.

### Office 32bit/64bit の違い

参考にしたのは次のページ.

> 64 ビット版の Office にはいくつかの制限事項がありますが、以下の場合に適しています。
>
> - **複雑な計算、多くのピボットテーブル、外部データベースへの接続、PowerPivot、PowerMap、または PowerView が含まれるエンタープライズ規模の Excel ブックなど、非常に大きなデータ セットを操作する場合。 64 ビット版の Office ではパフォーマンスが向上することがあります。**
> - PowerPoint で非常に大きな画像、ビデオ、またはアニメーションを操作する場合。 64 ビット版の Office は、このような複雑なスライド セットを扱うのに適していることがあります。
> - 非常に大きな Word 文書を操作する場合。 64 ビット版の Office は、サイズの大きな表、グラフィックなどのオブジェクトが含まれる Word 文書を扱うのに適していることがあります。
> - Project で 2 GB を超えるファイルを操作している場合。特に、プロジェクトに多くのサブプロジェクトが含まれる場合。
> - 既に使用している 64 ビット版の Office を保持したい場合。 **32 ビット版と 64 ビット版の Office プログラムは両立しないため、同一のコンピューターに両方をインストールすることはできません。**
> - アドインやドキュメントレベルのカスタマイズなど、社内 Office ソリューションを開発している場合。
> - 組織で、Office アプリケーションにハードウェアのデータ実行防止 (DEP) を適用する必要がある場合。 DEP は、一部の組織でセキュリティを強化するために使用する、ハードウェアとソフトウェアのテクノロジのセットです。
>
> 上記のいずれの状況も該当しない場合、通常は、32 ビット版の Office が適しています。     注 **32 ビット版の Office は、32 ビット版と 64 ビット版両方の Windows で問題なく動作します。**
>
> -- [Microsoft Office の 32 ビット版と 64 ビット版を選択する | MS Office 公式ページ](https://support.office.com/ja-jp/article/Microsoft-Office-%E3%81%AE-32-%E3%83%93%E3%83%83%E3%83%88%E7%89%88%E3%81%A8-64-%E3%83%93%E3%83%83%E3%83%88%E7%89%88%E3%82%92%E9%81%B8%E6%8A%9E%E3%81%99%E3%82%8B-2dee7807-8f95-4d0c-b5fe-6c6f49b8d261)

今回の直接の原因となった箇所についても注意書きがありました. それがこちら.

> 64 ビット版の Office の制限事項
>
> 場合によっては、64 ビット版の Office はパフォーマンスが向上することがありますが、次の制限事項があります。
>
> **ActiveX コントロールのライブラリである ComCtl コントロールを使用するソリューションは動作しません**。
>
> (以下省略)
>
> -- [64 ビット版の Office の制限事項 | MS Office 公式ページ](https://support.office.com/ja-jp/article/Microsoft-Office-%E3%81%AE-32-%E3%83%93%E3%83%83%E3%83%88%E7%89%88%E3%81%A8-64-%E3%83%93%E3%83%83%E3%83%88%E7%89%88%E3%82%92%E9%81%B8%E6%8A%9E%E3%81%99%E3%82%8B-2dee7807-8f95-4d0c-b5fe-6c6f49b8d261#BKMK_Limitations64bit)

VBAを走らせてどうこうする人にとっては上述の点が気になるところ.  
どうしても64bit版 office で動作させなければならないような状況でない限り、**Office 32bit 版を使った方が良い** という結論.

環境構築に無駄な時間を割きたくないですよね.  
1台のPCに 32bit/64bit 両方のOfficeを入れてこの問題を回避しよう、と思って試したけどダメだった.  
これは注意書きにある通り.  
結局 Office 64bit版 をアンインストール & Office 32bit版 をインストール して回避.

ちなみに、PC購入後に初めて MS Office を初めて使った時にプロダクトキーを打ち込んでいればプロダクトキーなしで再インストール可能.

## office 64bit をアンインストールして, 32bit版を再インストールする方法

先述の通り, 1台のPCに 32bit/64bit 両方の Office を入れることはできない.  
ここでは次の手順を紹介する.

- Office 64bit版をアンインストール
- Office 32bit版をインストール

### Office アンインストール

![Office 64bit アンインストール](/images/pages/posts/20160330/fe0c6db074f78d64bfccda5b0bdd4aa2.png)

1. `コントロール パネル\\プログラム\\プログラムと機能`
2. `Microsoft Office Home and Buisiness Premium -ja-jp` をアンインストール
    - Officeのバージョンは人によって異なるので注意
3. アンインストール後, 再起動

### 32bit版 Office インストール

1. MS アカウントにサインイン
2. サービスとサブスクリプション
3. Office 365設定
4. Office Home and Buisiness Premium
    - これは人によって異なるかも
5. 追加のインストールオプション
    - Office -32ビット(推奨) をインストール

![MS マイアカウント サインイン](/images/pages/posts/20160330/4cdb7d8b3cf7652626d9b410dbce7240.png)

![Office Home and Buisiness Premium](/images/pages/posts/20160330/160330_OfficePremium.png)

![Office 32bit インストール](/images/pages/posts/20160330/9008a579fe98b2e2cce91e6cde3a0809.png)

## まとめ

買ったPCが64ibt OSだからといって、Officeまで64bit版をインストールすると痛い目に遭う.

はじめて64bit OSのPCを買って調子に乗っていた.  
まさかOfficeまで 32bit/64bit の区別があるなんて思いもしなかった...  
環境構築って大切.  
良い勉強になった.

今回は以上.
