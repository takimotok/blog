---
title: 'Vue.js v-for で Object と配列を展開してみる'
tags: ['vue.js']
created_at: '2019-03-03'
---

Vue.js の `v-for` で次の場合をそれぞれ試してみた.

- Object を展開
- 配列に Object を格納したものを展開

フロント側からは, どのキーで, どんな値が渡されるかを知っていないと駄目だよね, という結論.

概要は次の通り.

## 動作環境

- vue.js 2.x

## 結論

配列を展開する場合と, Object を展開する場合は key, index に対して注意が必要.  
配列の key は 0 から始まる連番.  
Object の key は `key: value` の `key` の部分.

バックエンドからフロントへデータを渡す場合は, API仕様書等で返却するデータ構造を明確に定義しといた方がよさそう.

今回バックエンドからはこんなデータを渡す.

```
// js

data: {
  Object : {
      "id": "1",
      "name": "foo"
  },
  list: [
      {id: 2, name: 'foo'},
      {id: 3, name: 'bar'},
      {id: 4, name: 'hoge'},
  ]
}
```

↑ これを html でこんな具合に展開 ↓

```
<!-- html -->
  <div id="app">
    <!-- Object を渡す -->
    <table>
        <tr>
            <th>INDEX</th>
            <th>KEY</th>
            <th>VALUE</th>
        </tr>
        <tr v-for="(value, key, index) in Object" v-bind:key="value.id">
            <td>{{ index }}</td>
            <td>{{ key }}</td>
            <td>{{ value }}</td>
        </tr>
    </table>
    <br>
    <!-- Object を格納した配列を渡す -->
    <table>
        <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>INDEX</th>
            <th>KEY</th>
        </tr>
        <tr v-for="(item, key, index) in list" v-bind:key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ index }}</td>
            <td>{{ key }}</td>
            <td>{{ item }}</td>
        </tr>
    </table>
  </div>
```

実行結果

![](/images/pages/posts/20190303/v-for.png)

## 今回やりたいこと

今回は `v-for` の引数 value, key, index の挙動を確認する.  
`v-for` については詳しくは公式ドキュメントを参照.

- [リストレンダリング | jp.vuejs.org](https://jp.vuejs.org/v2/guide/list.html)

`v-for` はループの際に値以外にも情報を渡せる.  
こんな感じで↓

- `v-for="(value, key, index)`

今回は次のデータを渡して key, index の挙動を見てみる

## Object を v-for で展開する

Object を html に渡して `v-for` で展開してみる.

```
// js

var vm = new Vue({
  el: '#app',
  data: {
      Object : {
          "id": "1",
          "name": "foo"
      }
  }
});
```

```
<!-- html -->

<div id="app">
  <!-- Object を渡す -->
  <table>
      <tr>
          <th>INDEX</th>
          <th>KEY</th>
          <th>VALUE</th>
      </tr>
      <tr v-for="(value, key, index) in Object" v-bind:key="value.id">
          <td>{{ index }}</td>
          <td>{{ key }}</td>
          <td>{{ value }}</td>
      </tr>
  </table>
```

実行結果

![](/images/pages/posts/20190303/v-for_object.png)

index, key, value はそれぞれ次の通り.

- index
    - Object 内の何番目の要素か
- key
    - Object 内で `key: value` で指定した `key` のこと
- value
    - Object 内で `key:value` で指定した `value` のこと

実践的には, このオブジェクトが xxx という key を持っていない場合は xxx する, みたいな使い方ができそう.

## 配列 を v-for で展開する

次は配列を `v-for` で展開して value, key, index の使い方を確認する.

```
// js

var vm = new Vue({
  el: '#app',
  data: {
      list: [
          {id: 2, name: 'foo'},
          {id: 3, name: 'bar'},
          {id: 4, name: 'hoge'},
      ]
  }
});
```

```
<!-- html -->

<div id="app">
  <!-- Object を格納した配列を渡す -->
  <table>
      <tr>
          <th>ID</th>
          <th>NAME</th>
          <th>INDEX</th>
          <th>KEY</th>
      </tr>
      <tr v-for="(item, key, index) in list" v-bind:key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ index }}</td>
          <td>{{ key }}</td>
          <td>{{ item }}</td>
      </tr>
  </table>
</div>
```

実行結果

![](/images/pages/posts/20190303/v-for_list.png)

ここでは index, key について見てみる.

index は値が指定されていない.  
一方, key は配列の要素番号なので 0 から始まる連番になっている.

index はあくまでもオブジェクト内の要素番号を返してくれるものらしい.  
今回は配列を `v-for` で展開したからこういう結果になった....  
本当かな?

`index`, `key` を併用したけど, `index` のみ利用して書き直してみる↓

```
<!-- html -->

<div id="app">
  <table>
      <tr>
          <th>ID</th>
          <th>NAME</th>
          <th>INDEX</th>
      </tr>
      <tr v-for="(item, index) in list"
          v-bind:key="item.id"
      >
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ index }}</td>
      </tr>
  </table>
</div>
```

```
// js

var vm = new Vue({
  el: '#app',
  data: {
      list: [
          {id: 1, name: 'foo'},
          {id: 2, name: 'bar'},
          {id: 3, name: 'hoge'},
          {id: 4, name: 'fuga'},
          {id: 5, name: 'piyo'},
      ]
  }
});
```

実行結果

![](/images/pages/posts/20190303/0ff606b86feb3a4c188b3531255d4255.png)

できた.  
配列を展開する場合は `key`, `index` は併用しちゃいけないんだね.

## まとめ

フロント側から API を叩いたり, バックエンドからデータを受け取るときは次の点を意識する必要がありそう.

- どの object がどんな key を持っているか

API の開発をするときは Swagger や API Blueprint で仕様書を作るのが一般的だと思う.  
この手順は飛ばさないほうがよさそう.

今回は以上.
