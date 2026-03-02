# Google Analytics (GA4) および Google AdSense 設定ガイド

AIツールナビゲーターにGA4とAdSenseを導入するための、各種IDの取得および設定手順です。

## 1. Google Analytics (GA4) の設定

1. [Google Analytics コンソール](https://analytics.google.com/) にアクセスし、Googleアカウントでログインします。
2. 左下の管理（歯車アイコン）から「アカウントを作成」または既存のアカウントを選択し、「プロパティを作成」をクリックします。
3. プロパティ名（例：AI Tool Navigator）、タイムゾーン、通貨を設定し、作成を進めます。
4. データストリームの設定で「ウェブ」を選択し、本番環境のURL（例：`https://ai-tools-nav.com/`）とストリーム名を入力してストリームを作成します。
5. 作成完了後、画面右上に表示される **「測定ID」**（`G-XXXXXXXXXX` の形式）をコピーします。
6. **【ローカル開発用】** プロジェクト直下の `.env.local` ファイルに以下の環境変数を追加します（すでに追加済みの場合は不要です）。
```env
NEXT_PUBLIC_GA_ID="取得した測定ID（G-...）"
```

7. **【本番環境用 (Cloud Run)】** 本番環境へ反映させるために、GitHubリポジトリの **Settings > Secrets and variables > Actions** へ移動し、`New repository secret` から以下の内容を登録してください。
   - Name: `NEXT_PUBLIC_GA_ID`
   - Secret: 取得した測定ID（`G-XXXXXXXXXX`）

## 2. Google AdSense の設定

1. [Google AdSense](https://www.google.com/adsense/start/) にアクセスし、「ご利用開始」からアカウントを作成します。
2. 対象となるサイトのURLを入力し、設定を進めます。
3. 「サイトをリンク」のステップで、AdSenseから提供されるコードスニペットからご自身の **パブリッシャーID**（`ca-pub-XXXXXXXXXXXXXXXX` の形式）を確認します。または、アカウント情報画面からも確認可能です。
4. **【ローカル開発用】** プロジェクト直下の `.env.local` ファイルに以下の環境変数を追加します。
```env
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID="取得したパブリッシャーID（ca-pub-...）"
```

5. **【本番環境用 (Cloud Run)】** 同様に、GitHubリポジトリの **Settings > Secrets and variables > Actions** に以下の内容を登録してください。
   - Name: `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID`
   - Secret: 取得したパブリッシャーID（`ca-pub-XXXXXXXXX`）

6. AdSenseコンソール上で「審査をリクエスト」を行い、サイトの審査完了を待ちます（審査には数日〜数週間かかる場合があります）。

## 動作確認（ローカル）
設定後、開発環境で正しくIDが読み込まれているか確認する場合は、以下のコマンドでサーバーを起動します。

```bash
npm run dev
```
ブラウザでサイトにアクセスし、ソースコードの `<head>` や `<body>` に `G-XXXXXXXXXX` および `ca-pub-XXXXXXXXXX` が含まれるスクリプトが出力されていれば成功です。
