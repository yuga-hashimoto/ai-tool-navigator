import { getAllTools } from "@/lib/tools";
import { CompareView } from "@/components/CompareView";
import { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { filterToolList, sortToolsForEditorialLists } from "@/lib/editorial";
import { getComparisonHref } from "@/lib/compare-pages";
import { DynamicAdUnit } from "@/components/DynamicAdUnit";
import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";

  return {
    title: isJapanese ? "AIツール比較ハブ | AI Tool Navigator" : "Compare AI Tools | AI Tool Navigator",
    description: isJapanese
      ? "主要AIツールを横並びで比較。価格、検証状況、長所短所を確認し、最適なAIソリューションを見つけましょう。"
      : "Compare leading AI tools side-by-side. Evaluate features, pricing, review status, and pros/cons to find the best AI solution for your workflow.",
    alternates: {
      canonical: `/${locale}/compare`,
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tools = filterToolList(await getAllTools(locale)).sort(sortToolsForEditorialLists);
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("compare") },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);

  const copy = isJapanese
    ? {
        title: "AIツール比較ハブ",
        description:
          "主要AIツールを横並びで比較。価格、検証状況、長所短所を確認し、最適なAIソリューションを見つけましょう。",
        trustNote:
          "編集レビュー保留中の名称は除外しています。以下の比較セットは、実務で実際に検討されることが多い組み合わせに焦点を当てています。",
        presetTitle: "すぐに始められる比較セット",
        presetCta: "この組み合わせで比較",
      }
    : {
        title: "AI tool comparison hub",
        description:
          "Compare leading AI tools side-by-side. Evaluate pricing, review status, and pros/cons to find the right tool for your workflow.",
        trustNote:
          "Speculative or review-pending tools are intentionally excluded. The presets below focus on practical combinations that real professionals evaluate.",
        presetTitle: "Quick-start comparison presets",
        presetCta: "Compare this set",
      };

  const presets = [
    {
      title: isJapanese ? "人気AIアシスタント" : "Popular AI assistants",
      description: isJapanese
        ? "日常業務、調査、ライティングまで広く使う候補をまとめて比較。"
        : "Compare versatile assistants for everyday research, drafting, and problem solving.",
      href: getComparisonHref(["chatgpt", "claude", "perplexity"]),
    },
    {
      title: isJapanese ? "AIコーディング支援" : "AI coding stack",
      description: isJapanese
        ? "開発向けの主要候補を横並びで見比べ、レビューページへ送客できます。"
        : "Put leading coding-focused tools side by side before jumping into the full reviews.",
      href: getComparisonHref(["chatgpt", "cursor", "claude"]),
    },
    {
      title: isJapanese ? "AI動画生成" : "AI video generation",
      description: isJapanese
        ? "動画生成カテゴリの代表的な候補を比較して、用途と価格を見極めます。"
        : "Compare leading video generators on quality, workflow fit, and pricing before you click through.",
      href: getComparisonHref(["sora-2", "runway-gen-3", "luma-dream-machine"]),
    },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {copy.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {copy.description}
          </p>
          <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            {copy.trustNote}
          </p>
        </div>

        <div className="mx-auto mb-10 max-w-3xl">
          <AffiliateDisclaimer variant="compact" />
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
            {copy.presetTitle}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {presets.map((preset) => (
              <Link
                key={preset.title}
                href={preset.href}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{preset.title}</h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{preset.description}</p>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400">
                  {copy.presetCta}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <DynamicAdUnit
          index={0}
          type="content"
          slot="content"
          forceShow={true}
          className="mb-16"
        />

        <CompareView tools={tools} locale={locale} />
      </div>
    </div>
  );
}
