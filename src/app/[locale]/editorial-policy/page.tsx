import { Metadata } from "next";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { Link } from "@/i18n/routing";
import { getContentSyncStatus } from "@/lib/content-sync";
import { getLocalizationCoverageReport } from "@/lib/localization-audit";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { getTranslations } from "next-intl/server";
import NextLink from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(locale: string, value: string | null | undefined): string {
  if (!value) {
    return locale === "ja" ? "未実行" : "Not run yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return locale === "ja" ? "未実行" : "Not run yet";
  }

  return date.toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";

  return {
    title: isJapanese ? "編集方針・更新方針 | AI Tool Navigator" : "Editorial Policy | AI Tool Navigator",
    description: isJapanese
      ? "レビュー基準、日本語化の進捗、差分監視による更新フローを公開しています。"
      : "Our review standards, localization progress, and automated content monitoring workflow.",
    alternates: {
      canonical: `/${locale}/editorial-policy`,
    },
  };
}

export default async function EditorialPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const coverage = getLocalizationCoverageReport();
  const contentSyncStatus = getContentSyncStatus();
  const latestReport = contentSyncStatus.latestReport;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: isJapanese ? "編集方針" : "Editorial Policy" },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const copy = isJapanese
    ? {
        title: "編集方針・更新方針",
        intro:
          "AI Tool Navigator では、比較・レビュー・収益導線を分けて管理しつつ、日本語化と鮮度維持を継続的に進めています。",
        reviewTitle: "レビュー基準",
        reviewPoints: [
          "カテゴリLPや比較導線に出すページは、名称、リンク先、主要機能、更新日を優先確認します。",
          "確認が不十分な名称や将来断定の強い固定記事は主要導線から外し、必要に応じて noindex にします。",
          "アフィリエイト開示は明示し、順位や掲載方針とは分離して説明します。",
        ],
        freshnessTitle: "自動更新フロー",
        freshnessPoints: [
          "公式ページを取得し、前回スナップショットとの差分を比較します。",
          "差分があれば、ヒューリスティック要約または LLM 要約で変更点を短く整理します。",
          "結果は JSON レポートとして保存し、cron/API から定期実行できます。",
          "大きな変更候補は人間レビューの対象に回し、比較ページや記事更新の判断材料にします。",
        ],
        coverageTitle: "日本語化の進捗",
        syncTitle: "差分監視の状態",
        toolsCoverage: "ツール日本語化",
        postsCoverage: "記事日本語化",
        missingLabel: "未翻訳の例",
        trackedSnapshots: "監視対象",
        lastRun: "最終実行",
        changed: "差分あり",
        unchanged: "差分なし",
        errors: "エラー",
        monitorCta: "監視 API を確認",
        disclosureCta: "広告開示を見る",
        none: "なし",
      }
    : {
        title: "Editorial Policy",
        intro:
          "AI Tool Navigator separates review standards, monetization, and localization work while continuously improving freshness and Japanese coverage.",
        reviewTitle: "Review standards",
        reviewPoints: [
          "Pages surfaced in category hubs and comparison entry points are prioritized for naming, destination, core feature, and last-updated checks.",
          "Pages with unresolved naming issues or strong future-dated claims are removed from primary entry points and may be noindexed.",
          "Affiliate disclosure is explicit and handled separately from ranking or editorial inclusion decisions.",
        ],
        freshnessTitle: "Automated update workflow",
        freshnessPoints: [
          "Official pages are fetched and compared against the previous snapshot.",
          "When a diff is detected, the system generates a short heuristic summary or an LLM summary if a key is configured.",
          "Results are written to JSON reports and can be triggered by cron or API.",
          "Large or suspicious changes are intended for human review before editorial pages are refreshed.",
        ],
        coverageTitle: "Japanese localization progress",
        syncTitle: "Content monitoring status",
        toolsCoverage: "Tool localization",
        postsCoverage: "Post localization",
        missingLabel: "Missing examples",
        trackedSnapshots: "Tracked snapshots",
        lastRun: "Last run",
        changed: "Changed",
        unchanged: "Unchanged",
        errors: "Errors",
        monitorCta: "Open monitoring API",
        disclosureCta: "Read affiliate disclosure",
        none: "None",
      };

  const coverageCards = [
    {
      title: copy.toolsCoverage,
      coveragePercent: coverage.tools.coveragePercent,
      totalJa: coverage.tools.totalJa,
      totalEn: coverage.tools.totalEn,
      missing: coverage.tools.missingJa,
    },
    {
      title: copy.postsCoverage,
      coveragePercent: coverage.posts.coveragePercent,
      totalJa: coverage.posts.totalJa,
      totalEn: coverage.posts.totalEn,
      missing: coverage.posts.missingJa,
    },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {copy.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {copy.intro}
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {copy.reviewTitle}
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {copy.reviewPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {copy.freshnessTitle}
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {copy.freshnessPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {copy.coverageTitle}
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {coverageCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.title}</p>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {card.coveragePercent}%
                    </p>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {card.totalJa} / {card.totalEn}
                  </p>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.missingLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {card.missing.length > 0 ? card.missing.slice(0, 6).join(", ") : copy.none}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-blue-200 bg-blue-50 p-8 dark:border-blue-800/50 dark:bg-blue-950/30">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {copy.syncTitle}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/80 p-5 dark:bg-zinc-950/70">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{copy.trackedSnapshots}</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {contentSyncStatus.trackedSnapshots}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-5 dark:bg-zinc-950/70">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{copy.lastRun}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
                {formatDate(locale, contentSyncStatus.lastRunAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-5 dark:bg-zinc-950/70">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{copy.changed}</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {latestReport?.totals.changed || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-5 dark:bg-zinc-950/70">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{copy.errors}</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {latestReport?.totals.errors || 0}
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {latestReport?.items[0]?.summary ||
              (isJapanese
                ? "まだ監視レポートは生成されていません。`/api/content-sync/run` または `npm run content:sync` で初回実行できます。"
                : "No monitoring report has been generated yet. Use `/api/content-sync/run` or `npm run content:sync` to create the first baseline.")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/affiliate-disclosure"
              className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {copy.disclosureCta}
            </Link>
            <NextLink
              href="/api/content-sync/status"
              className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {copy.monitorCta}
            </NextLink>
          </div>
        </section>
      </div>
    </div>
  );
}
