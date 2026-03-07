import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  return {
    title: isJapanese ? "利用規約 | AI Tool Navigator" : "Terms of Service | AI Tool Navigator",
    description: isJapanese
      ? "AI Tool Navigator の利用条件、免責、広告・比較導線の取り扱いを説明します。"
      : "Terms of Service for AI Tool Navigator.",
    alternates: {
      canonical: `/${locale}/terms`,
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("terms") },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const sections = isJapanese
    ? [
        {
          title: "1. 利用について",
          body: "AI Tool Navigator を利用することで、本規約に同意したものとみなします。掲載情報は比較・調査の補助を目的としています。",
        },
        {
          title: "2. 情報の扱い",
          body: "サイト上の比較、レビュー、価格、更新情報はできる限り確認していますが、公式サイト側で変更されることがあります。最終判断は提供元の一次情報を基準にしてください。",
        },
        {
          title: "3. 免責",
          body: "掲載情報の利用により生じた損害、機会損失、契約上の不利益について、当サイトは直接の責任を負いません。",
        },
        {
          title: "4. 広告・アフィリエイト",
          body: "一部リンクはアフィリエイトリンクを含みます。収益導線は開示し、編集判断とは分離して運用します。",
        },
        {
          title: "5. 規約の更新",
          body: "本規約は必要に応じて更新されることがあります。継続利用時点の内容が適用されます。",
        },
      ]
    : [
        {
          title: "1. Use of the site",
          body: "By using AI Tool Navigator, you agree to these terms. The site is intended to support comparison and research, not to replace direct vendor verification.",
        },
        {
          title: "2. Information quality",
          body: "We try to keep review, pricing, and update information current, but vendors can change official details at any time. Final decisions should be based on primary sources.",
        },
        {
          title: "3. Disclaimer",
          body: "AI Tool Navigator is not liable for losses, missed opportunities, or business decisions made from site content alone.",
        },
        {
          title: "4. Advertising and affiliate links",
          body: "Some links may be affiliate links. Revenue relationships are disclosed and handled separately from editorial surfacing decisions.",
        },
        {
          title: "5. Updates",
          body: "These terms may be updated when the product or operating model changes. Continued use means the latest version applies.",
        },
      ];

  return (
    <div className="bg-background min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          {isJapanese ? "利用規約" : "Terms of Service"}
        </h1>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {isJapanese ? "最終更新日" : "Last updated"}: {new Date().toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US")}
          </p>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10">
                {section.title}
              </h2>
              <p className="leading-7 [&:not(:first-child)]:mt-6">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
