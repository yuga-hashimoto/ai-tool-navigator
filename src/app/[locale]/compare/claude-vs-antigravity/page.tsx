import { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";

  return {
    title: isJapanese ? "比較ページを更新中 | AI Tool Navigator" : "Comparison Under Review | AI Tool Navigator",
    description: isJapanese
      ? "この比較ページは編集レビュー中です。比較ハブまたはカテゴリLPから最新の比較導線をご利用ください。"
      : "This comparison page is under editorial review. Use the comparison hub or category pages for current recommendations.",
    robots: {
      index: false,
      follow: false,
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
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("compare"), href: "/compare" },
    { label: isJapanese ? "レビュー保留" : "Under review" },
  ];

  const copy = isJapanese
    ? {
        title: "この比較ページはレビュー保留中です",
        body:
          "ブランド名や掲載内容の信頼性を見直しているため、この固定比較記事は主要導線とインデックスから外しています。最新の比較は比較ハブまたはカテゴリLPから確認してください。",
        compareCta: "比較ハブへ",
        categoryCta: "コーディングカテゴリへ",
      }
    : {
        title: "This comparison page is under review",
        body:
          "We are re-evaluating the naming and editorial reliability of this fixed comparison page, so it has been removed from primary entry points and indexing.",
        compareCta: "Open comparison hub",
        categoryCta: "Browse coding category",
      };

  return (
    <div className="bg-white dark:bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {copy.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/compare"
              className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {copy.compareCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/category/coding"
              className="group inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {copy.categoryCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
