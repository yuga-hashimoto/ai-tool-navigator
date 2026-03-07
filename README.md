# AI Tool Navigator

AIツールの比較、カテゴリLP、レビュー、広告導線、アフィリエイト計測、日本語ローカライズ、自動更新監視をまとめて扱う Next.js アプリです。

## Local Development

```bash
npm install
npm run dev
```

開発サーバーは `http://localhost:3000` です。

## Core Scripts

```bash
npm run dev
npm run build
npx tsc --noEmit
npm run content:sync -- --slugs=claude --no-llm
npm run content:localize:ja
```

`.env.example` に主要な広告、Google Sheets、content sync、Stripe、Redis 関連の env をまとめています。

## Content Structure

- `content/tools/en`, `content/tools/ja`
- `content/posts/en`, `content/posts/ja`
- `src/app/[locale]/category/[slug]/page.tsx`: カテゴリLP
- `src/app/[locale]/compare/[comparisonSlug]/page.tsx`: 比較テンプレ
- `src/app/[locale]/tools/[slug]/page.tsx`: ツール詳細

## Localization

- `ja` と `en` の locale をサポート
- `npm run content:localize:ja` で不足している日本語版コンテンツをテンプレ生成
- カバレッジ確認:
  - `GET /api/i18n/coverage`
  - `GET /ja/editorial-policy`

## Content Sync

公式ページとの差分監視フローを実装しています。

- 実行 API: `GET/POST /api/content-sync/run`
- 状態 API: `GET /api/content-sync/status`
- ローカル実行: `npm run content:sync`

対応内容:

- 公式ページ取得
- 前回スナップショットとの差分判定
- ヒューリスティック要約
- `OPENAI_API_KEY` または `CONTENT_SYNC_OPENAI_API_KEY` がある場合の LLM 要約
- `CONTENT_SYNC_OPENAI_ENDPOINT` を指定すると OpenRouter など OpenAI 互換 endpoint も利用可能
- JSON レポート保存

保存先:

- `data/content-sync-state.json`
- `data/content-sync-reports/latest.json`

cron から叩く場合は `CONTENT_SYNC_SECRET` または `CRON_SECRET` を設定し、`Authorization: Bearer ...` を付けて `/api/content-sync/run` を呼んでください。

GitHub Actions で定期実行する場合は `.github/workflows/content-sync.yml` を使い、`NEXT_PUBLIC_SITE_URL` を GitHub Variables、`CONTENT_SYNC_SECRET` を GitHub Secrets に設定してください。

## Revenue / Lead Capture

- アフィリエイトクリック保存: `POST /api/affiliate/track`
- コンバージョン保存: `POST /api/affiliate/conversion`
- 広告/スポンサー問い合わせ: `POST /api/partner-inquiry`

関連ページ:

- `/advertise`
- `/sponsor`
- `/affiliate-disclosure`
- `/editorial-policy`

Google Sheets が未設定でも、スポンサー問い合わせは `data/partner-inquiries.json` に保存されます。

## Google Sheets Integration

以下を設定すると、購読・送信・スポンサー問い合わせを Google Sheets にも保存できます。

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_SHEET_ID`

使用シート:

- `Subscribers`
- `Submissions`
- `Partnerships`

## Ad Configuration

AdSense / GAM は env ベースです。未設定なら広告枠は表示しません。

- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_GRID`
- `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_CONTENT`
- `NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR`
- `NEXT_PUBLIC_GOOGLE_GAM_NETWORK_ID`
- `NEXT_PUBLIC_GOOGLE_GAM_SLOT_GRID`
- `NEXT_PUBLIC_GOOGLE_GAM_SLOT_CONTENT`
- `NEXT_PUBLIC_GOOGLE_GAM_SLOT_SIDEBAR`

## Health Check

`GET /api/health` で以下を返します。

- DB 接続状態
- メモリ/CPU 情報
- content sync の最終実行情報

## Notes

- `firebase-debug.log` は既存のローカル差分です。
- 収益案件の実契約、GitHub / Cloud Run 側の secret・variable 投入はリポジトリ外の作業が必要です。
