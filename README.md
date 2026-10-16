# のんだどん Webサイト

## ファイル構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | ページ本体（文章はここを直接編集） |
| `css/style.css` | デザイン（色は先頭の `:root` でまとめて変更可） |
| `js/news.js` | お知らせ（ここに追記するだけで更新） |
| `js/main.js` | メニュー開閉・お知らせ表示の処理 |
| `images/` | 画像 |

## 公開方法（GitHub Pages）

公開URL：https://main.d1z06gvf79o0ov.amplifyapp.com/

### 最初の1回だけ

1. GitHubでリポジトリを開き、**Settings → Pages** を開く
2. **Source** を「Deploy from a branch」にする
3. **Branch** を `main`、フォルダを `/ (root)` にして **Save**
4. 数分後、上のURLで表示されることを確認

### 更新するとき

`main` ブランチに push するだけで、数分後にサイトに反映されます。

```sh
git add .
git commit -m "更新内容"
git push
```

データベースやPHPは不要です。`.nojekyll` は GitHub の変換処理（Jekyll）を止めるためのファイルなので消さないでください。

> リポジトリ名やアカウント名を変えた場合は、`index.html` の `og:url` と `og:image` のURLも書き換えてください。

## 公開前に書き換えるところ

1. `index.html` のメールアドレス `nondadon@example.com`（2か所）
2. `js/news.js` のお知らせの日付と内容（仮の内容が入っています）
3. `index.html` の「ISHIN 2026での活動」の年表（事実と合っているか確認）
4. メンバーの役割（必要なら `index.html` のコメントの通りに追加）

## お知らせの追加方法

`js/news.js` のいちばん上に次の形で追加します。

```js
{ date: "2026-11-01", title: "タイトル", body: "本文（省略可）" },
```
