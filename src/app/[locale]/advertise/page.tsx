import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { PartnerInquiryForm } from "@/components/PartnerInquiryForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";

  return {
    title: isJapanese ? "広告掲載・プロモーション | AI Tool Navigator" : "Advertise | AI Tool Navigator",
    description: isJapanese
      ? "AI Tool Navigator での広告掲載、スポンサー枠、カテゴリ露出について問い合わせできます。"
      : "Plan sponsored placements, category exposure, and promotional campaigns on AI Tool Navigator.",
    alternates: {
      canonical: `/${locale}/advertise`,
    },
  };
}

export default async function AdvertisePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("advertise") },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const packageOptions = isJapanese
    ? ["カテゴリ露出", "比較ページ連動", "ホーム露出", "カスタム相談"]
    : ["Category exposure", "Comparison bundle", "Homepage feature", "Custom plan"];
  const packages = isJapanese
    ? [
        {
          name: "カテゴリ露出",
          price: "月額 $49 から",
          points: ["カテゴリLPや一覧への露出強化", "レビュー導線への送客", "比較導線との接続"],
        },
        {
          name: "比較ページ連動",
          price: "月額 $149 から",
          points: ["比較ページ上の送客枠", "ツール詳細への二段導線", "クリック計測ベースで改善しやすい構成"],
        },
        {
          name: "ホーム露出",
          price: "月額 $299 から",
          points: ["トップ導線での優先露出", "カテゴリ回遊との組み合わせ", "比較・詳細・公式サイト送客を一気通貫で設計"],
        },
      ]
    : [
        {
          name: "Category exposure",
          price: "From $49/mo",
          points: ["Priority visibility inside category hubs", "Traffic routed into review pages", "Connected to comparison paths"],
        },
        {
          name: "Comparison bundle",
          price: "From $149/mo",
          points: ["Placement near comparison flows", "Second-step routing into tool reviews", "Designed for measurable click-through optimization"],
        },
        {
          name: "Homepage feature",
          price: "From $299/mo",
          points: ["Top-level homepage visibility", "Blended with category discovery", "Designed around compare -> review -> official-site funnels"],
        },
      ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            {isJapanese ? "広告掲載・プロモーション" : "Advertising & promotion"}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {isJapanese
              ? "カテゴリLP、比較ページ、ツール詳細を横断して露出設計できます。単なるバナー掲載ではなく、比較導線と公式サイト送客を前提にした構成です。"
              : "Campaigns can span category hubs, comparison pages, and tool reviews. The focus is not just impressions, but compare-to-review-to-official-site routing."}
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {pkg.name}
              </h2>
              <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{pkg.price}</p>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {pkg.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isJapanese ? "問い合わせフォーム" : "Campaign inquiry"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {isJapanese
              ? "掲載したいカテゴリ、比較したい競合、想定予算が決まっていればそのまま記載してください。Google Sheets が未設定でもローカル保存されます。"
              : "Share the categories, comparison pages, and budget you care about. Inquiries are stored even if Google Sheets is not configured yet."}
          </p>
          <div className="mt-8">
            <PartnerInquiryForm inquiryType="advertise" locale={locale} packageOptions={packageOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
