---
title: 'spreadsheet から google calendar へスケジュールを一括登録する'
tags: ['spreadsheet', 'google calendar']
created_at: '2020-03-31'
---

google calendar への予定入力手間削減のために GAS (Google Apps Script) を書いた.  
予定が記入された spread sheet から google calendar へボタン一つで登録するためのスクリプト.

概要は次の通り.

## 結論

\--- '20.04.02 追記 4/27 - 4/30 が重複登録されるとのフィードバックを貰う. 時間があるときに調査します.

\--- '20.04.09 追記 繰り返し `登録` ボタンを押下する場合に再現. 重複箇所は手動で削除すればいいという判断. 一旦放置. \--- 追記 ここまで

スプレッドシートに設置した `登録` ボタンクリックでシート内スケジュールを google calendar へ一括登録できるスクリプトを書いた.  
src は github に置いた.

- [takimotok/spreadsheet2calednar | github](https://github.com/takimotok/spreadsheet2calednar)

実際の動きはこんな感じ.

![](/images/pages/posts/20200331/smpl_sheet2calendar.gif)

利用フローはこんな感じ.

![](/images/pages/posts/20200331/flow-1.png)

予定タイトルは手入力でもいいし, ボタンクリックで生成しても ok.  
詳細欄は未入力でも ok.

## 動作環境

- chrome
    
    - win, mac で動作確認済

## 前提条件

対象読者はこんな方々.

- js の基本が分かる人
- スプレッドシートの予定を一括で google calendar へ登録したい人
- パートナー, 従業員, 知人などのスケジュール管理・共有を楽に行いたい人

コードの書き方は次の点を前提としている.

- ECMAScript

最近 GAS で V8 runtime がサポートされて ECMAScript が使えるようになった.

- cf.) [V8 Runtime Overview | Google Apps Script](https://developers.google.com/apps-script/guides/v8-runtime?hl=ja)

今回のコードはこの辺を使っている.

- `let`
- `const`
- arrow function

## 背景

私にはシフト制で働く知人がいる.  
ITスキルは excel や spread sheet の関数がちょっと使えるくらい.

ひょんなことから私は知人のシフトを google calendar で共有してもらっている.  
どうやら知人はシフトを google calendar へ手入力していたらしい.

ざっと 20日/月 働くとして, 勤務時間もタイトルも異なる予定を毎月 20件 手入力するのは手間だ.  
しかも COVID-19 の影響で急なシフト変更があるから, 都度変更するのは大きな労力.

なんとかできないか.

職場からは excel で作られたシフト表が印刷して渡されるらしい.  
印刷前の excel データへは勤務先 pc からアクセス可能とのこと.

excel で作られた表は次の列を持つ.

- 日 (`yy/dd`)
- 曜日
- 勤務形態
    
    - `勤務日` or `休`
- 開始時間 (`HH:MM`)
- 退勤時間 (`HH:MM`)
- 拘束時間 (`HH:MM`)
- 実労働 (`HH:MM`)

一方, google calendar は予定のタイトル欄, 説明欄をそれぞれ持つ.

excel のデータにアクセスできるなら, スプレッドシートへコピペもできるはず.  
毎月20件手動で入力 -> コピペ & ボタンクリック に労力を抑えることはできないか ?

スプレッドシートもカレンダも google のサービスなんだからできるはず...  
やってみよう.

背景については以上.

## コード説明

全部解説すると長いから, 工夫した点やハマった点について紹介.  
コードは github に上げた.

- [takimotok/spreadsheet2calednar | github](https://github.com/takimotok/spreadsheet2calednar)

### コード全体の流れ: spread sheet データを配列に格納してぐるぐる回すだけ

コード全体の処理はこんな感じ.

1. カレンダに登録済みの予定がある場合は全削除
    
    - 重複登録を避けるため
2. スプレッドシート データを配列に格納
3. 配列データをぐるぐる回して google calendar へ登録

登録処理は `calendar.createEvent()` を利用. こんな感じ.

```
calendar.createEvent(
  title,
  startDate,
  endDate,
  options
);
```

### calendar id はセル入力にした

今回のスクリプト利用にあたって, シフト用に新たにカレンダを追加してもらった.  
calendar id は google calendar サイドバーのカレンダにオンマウスして, `Settings > Integrate calendar` から取得可能.

`calendar id` はシートに記入してもらう仕様にした. なるべく src 内に秘匿情報は持ちたくないので.

シートはこんな感じ.  
`C2` セルが calendar id.

![](/images/pages/posts/20200331/smpl_sheet.png)

calendar id 取得関数はこんな感じ.

```
function getCalendarId () {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let val = sheet.getRange('C2').getValue();

  if (! val.length) {
    Browser.msgBox('カレンダ ID が指定されていません。');
    return;
  }

  return val;
}
```

今回のスクリプトは calendar id がないと動かない. 未入力の場合を想定してメッセージを仕込んだ.

### タイトル生成処理

勤務開始時刻と拘束時間を場合分けしてタイトル生成処理を自動化した.  
パターンは次の点をたすき掛け.

- 早
- 中
- 遅

↑ と ↓ の 3 x 2 パターン

- short
- long

これは知人の職場特有の表現.  
汎用性が低いと思うのでコードは github を見て頂けますと.

### エントリーポイントの関数はシンプルに: `main()`

データの前処理や初期処理を追加することになったら嫌だなー と思って entry point として `main()` を用意した.  
ボタンクリック時に実行される関数として利用する.

```
function main() {
  init();
  createSchedule();
}
```

`init()` は初期処理. カレンダ登録前にやっておくべき処理はここに格納. 今回は内部的に登録済みの予定を全削除する method を呼んでいる.  
`createSchedule()` は calendar へのリクエスト実行する処理.

## まとめ: 反省点とか改善点とか

コードの書き方や運用面でいくつか反省があるので簡単にまとめる.

### コードについて反省: 変更に弱い設計になった

書いたコードに対する反省点はこれ.

- メンテに弱い
    
    - セル, 列 の定数・変数定義が分散しているから変更箇所が多い
- リクエストし過ぎ問題

ちょっと解説.

まずメンテに弱い点について.

変更に弱いコードになった. スコープの範囲が広がるのを嫌い, 複数箇所で同様の変数・定数宣言をした事が原因.  
今後メンテが必要になったら class を利用して再設計すると思う.

spread sheet ではどのセルに何のデータが入るのかは一意に決まる性質上, 基本的には変数・定数宣言は1度で済む.  
関数冒頭でこれらの宣言をすることが多い.

関数冒頭で変数宣言すると実処理までのスコープが広がりやすくなる. スクロールして定義元を何度も見直すのは嫌だ.  
今回はこれを避けた. スコープが狭いコードの方が処理が追いやすいので.

たとえば, `登録` ボタンにアサインした `main()` 関数はこんな感じ.

```
function main() {
  init(); // 内部で deleteRegisteredScheduleList() を呼んでいる
  createSchedule();
}
```

`init()` は初期処理で内部的に `deleteRegisteredScheduleList()` を呼び出している.  
`createSchedule()` は spread sheet データ取得 & カレンダ登録処理.

ここで `deleteRegisteredScheduleList()` と `createSchedule()` を見てみると, `const COL_DATE = 0;` がそれぞれの関数内で宣言されている.

```
/**
 * delete registered calendar data
 */
function deleteRegisteredScheduleList () {
  const GOOGLE_CALENDAR_ID = getCalendarId();
  const COL_DATE = 0; // 配列で取得したデータの日付カラム

  // 以下略
```

```
/**
 * create and register schedules into google calendar
 */
function createSchedule() {
  // credential 取得
  const GOOGLE_CALENDAR_ID = getCalendarId();

  // sheet から取得したデータは配列なので, 対象列を 0 始まりで指定
  const COL_DATE        = 0;
  const COL_DAY         = 1;
  const COL_START_TIME  = 3;

  // 以下略
```

これは一見すると無駄に思える. 先述した通り, 1関数内に処理を纏めれば1度で済むはずの宣言だからだ.  
でも, 処理を分けた方が関数単体で見るとスコープの範囲が狭くなり, 処理が追いやすい.

今後メンテの手間が増えそうなら, schedule class 的なものを作成してセルの値をプロパティとして持たせるような設計にしたい.  
そうすれば, セルデータ取得処理を1箇所にまとめることができるし, 列の増減, セルに入るデータ種別変更にも少ない変更箇所で対応できる(はず).

次に, リクエストし過ぎ問題について.

google calendar へのリクエストの流れはこんな感じ.

1. 登録済み予定があったらカレンダから削除
    
    - 1件ずつ loop
2. およそ30行 x 7列 のデータをパース
3. 配列に格納
4. カレンダ登録 (リクエスト)
    
    - 1件ずつ loop

削除, 登録各処理で各々1件ずつ処理している.  
たとえば delete 処理は次のように `forEach()` で回してる.

```
function deleteRegisteredScheduleList () {
  const GOOGLE_CALENDAR_ID = getCalendarId();
  const COL_DATE = 0; // 配列で取得したデータの日付カラム

  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let dt = sheet.getRange('B6').getValue();
  let startTime = new Date(dt);
  let endTime = new Date(startTime.getFullYear(), startTime.getMonth() + 1, 0); // 月末

  let calendar = CalendarApp.getCalendarById(GOOGLE_CALENDAR_ID);
  let eventList = calendar.getEvents(startTime, endTime);
  eventList.forEach(event => {
    event.deleteEvent();
  });
}
```

これ, カレンダ API 叩きすぎだよね.  
時間の関係で調べきれてないけど, 配列データを一括でイベント登録/削除可能な method ないのかな?

### 運用面の振返り

反省点, 工夫点 をそれぞれ紹介.

まずは反省点.

- spread sheet をそのまま共有したのは良くなかったかも

今回は作成したシートをそのまま共有した. 利用者数=1 かつ プライベート利用だったので.  
シートをそのまま共有したことによる懸念点はコード改竄.  
利用者が旧知の知人ではない (複数人利用が前提 or 業務利用) ならテンプレートとして利用してもらうのがベター.

次は工夫点.

- `calendar id` はシートに記載してもらう
- 新しいカレンダを追加してもらう

`calendar id` をシートに記載してもらうメリットはこれ.

- src に秘匿情報を持たずに済む
- 知人が...
    
    - 対象カレンダを後追いできる
    - このシステムを使わなくなったら対象セルを削除すれば ok (src 変更不要)

google account を利用してカレンダ連携することもできそうなんだけど, 次の理由からやめた.

- 職場で同僚に編集中シートを覗き込まれたら知人のメアドが判明しちゃう

新しいカレンダを追加して貰うことのメリットはこれ.

- プライベートの予定と分離することで, シフトだけを他者に共有できる
- 万が一登録スケジュールが壊れても(全削除とか), 影響範囲(被害)を1カレンダに留めることが出来る

現在月が変わっても動く想定なので, 来月の使用感もヒアリングする予定.  
バグがない事を切に願う.

### 感想

知人は今回の出来に満足しているらしい.  
これまでは google calendar へ 30分 程度掛けてシフトを手入力していた. それが コピペ & ボタンクリック の数秒で済む.  
手間削減に大きく貢献しているとのこと.

ところで, 次の全ての条件に当てはまる企業は G Suite 導入を検討するといいかも.

- 資金力がある
- 自前のシステムを持っていない
- 業務でシフト作成・共有が必要

G Suite 導入は従業員の作業効率化や部署間の情報共有簡易化, 外部サービス連携促進, etc... とメリットが多い.  
(今回のスプレッドシートは G Suite を導入せずとも個人レベルで無料で使える.)  
GAS (Google Apps Script) はほぼ js だからメンテ可能な人材は世の中に溢れているだろうし, それなりに使い回しの良い設計にすればそこまでメンテコストはかからない.

知人曰く, ここ最近 COVID-19 の影響で急なシフト変更が多いらしい.  
今後リモートワークも進むだろうし, 働き方やシフトの在り方も大きく変わってくると思う.  
経営層や現場で働く人, お客さん, etc... 関わる人全てが幸せになるような選択が出来るといいよね.  
もし本記事を決定権のある方が読んでいらっしゃいましたら, COVID-19 が落ち着いた頃にシフト管理方法を見直してみて下さい.  
現場はシフト作成・共有の手間だけでヒーヒー言ってるらしいです.

話を聞く限りでは, 知人の現場はちょっとしたシステム導入で業務改善できそうな点が多い.  
たとえば, `シフト_04.xlsx`, `シフト_new.xlsx` のような版数管理のせいで誰が最新版を持っているか不明だとか.  
その最新版かどうか判らない excel をメールで送受信しているだとか.

最後に感想を一言.

今回のように人の役に立てるのは嬉しい.  
js が書けてよかった.

今回は以上.
