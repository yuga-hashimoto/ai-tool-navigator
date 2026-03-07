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
    title: isJapanese ? "スポンサー募集 | AI Tool Navigator" : "Sponsorship | AI Tool Navigator",
    description: isJapanese
      ? "スポンサー掲載、特集枠、共同プロモーションについて問い合わせできます。"
      : "Request sponsored placements, featured bundles, and custom partnership campaigns.",
    alternates: {
      canonical: `/${locale}/sponsor`,
    },
  };
}

export default async function SponsorshipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("sponsor") },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const packageOptions = isJapanese
    ? ["特集掲載", "比較ページスポンサー", "共同キャンペーン", "カスタム相談"]
    : ["Featured sponsorship", "Comparison sponsor", "Joint campaign", "Custom plan"];

  const copy = isJapanese
    ? {
        title: "スポンサー掲載",
        intro:
          "ホーム、カテゴリLP、比較ページ、記事導線を組み合わせたスポンサー枠を設計できます。レビューや比較の信頼性を損なわないよう、スポンサー掲載は明示して扱います。",
        sections: [
          {
            title: "特集掲載",
            body: "ホームやカテゴリ導線の中で、編集上の通常露出と分けてスポンサー枠として表示します。",
          },
          {
            title: "比較ページスポンサー",
            body: "比較文脈に近い位置で認知を取りつつ、公式サイトとレビュー導線の両方へ送客できます。",
          },
          {
            title: "共同キャンペーン",
            body: "特定カテゴリ、比較テーマ、日本語市場向けの露出設計をまとめて相談できます。",
          },
        ],
      }
    : {
        title: "Sponsored placements",
        intro:
          "Sponsorships can combine homepage, category-hub, comparison, and editorial routes. Paid placement is disclosed explicitly so monetization does not blur with standard editorial surfacing.",
        sections: [
          {
            title: "Featured sponsorship",
            body: "Reserved visibility on homepage or inside high-intent category pathways, clearly separated from standard editorial exposure.",
          },
          {
            title: "Comparison sponsor",
            body: "Awareness near comparison intent while still routing users into detailed review pages and official-site clicks.",
          },
          {
            title: "Joint campaign",
            body: "Custom campaigns around a category, a comparison theme, or a Japanese-market launch sequence.",
          },
        ],
      };

  return (
    <div className="bg-white dark:bg-black min-h-screen text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {copy.intro}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {copy.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isJapanese ? "スポンサー相談フォーム" : "Sponsorship inquiry"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {isJapanese
              ? "比較したい競合、狙いたいカテゴリ、期間、予算感があればそのまま記載してください。"
              : "Share your target categories, competitor context, campaign duration, and budget range if you already know them."}
          </p>
          <div className="mt-8">
            <PartnerInquiryForm inquiryType="sponsor" locale={locale} packageOptions={packageOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
