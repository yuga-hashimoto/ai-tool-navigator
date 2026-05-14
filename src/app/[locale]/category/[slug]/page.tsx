import { getAllTools } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CATEGORY_MAPPINGS } from "@/lib/categories";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { DynamicAdUnit } from "@/components/DynamicAdUnit";
import { AffiliateLinkButton } from "@/components/AffiliateLinkButton";
import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateFAQSchema,
} from "@/lib/schema";
import { getCategoryLandingContent } from "@/lib/category-landing";
import { filterToolList, sortToolsForEditorialLists } from "@/lib/editorial";
import { getComparisonHref } from "@/lib/compare-pages";

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAPPINGS).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  if (!Object.keys(CATEGORY_MAPPINGS).includes(slug)) {
    return {
      title: "Category Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "CategoryPage" });
  const title = t(`${slug}_title` as never);
  const description = t(`${slug}_description` as never);
  const fullTitle = `${title} - AI Tool Navigator`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: `/${locale}/category/${slug}`,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: `/${locale}/category/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

function formatUpdatedDate(value: string | undefined, locale: string): string {
  if (!value) {
    return locale === "ja" ? "未掲載" : "Not listed";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return locale === "ja" ? "未掲載" : "Not listed";
  }

  return parsed.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPricingLabel(
  locale: string,
  price: string | undefined,
  pricing: "free" | "freemium" | "paid" | "contact" | undefined,
): string {
  if (price) {
    return price;
  }

  const labels =
    locale === "ja"
      ? {
          free: "無料",
          freemium: "フリーミアム",
          paid: "有料",
          contact: "要問い合わせ",
        }
      : {
          free: "Free",
          freemium: "Freemium",
          paid: "Paid",
          contact: "Contact sales",
        };

  return pricing ? labels[pricing] : locale === "ja" ? "未掲載" : "Not listed";
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isJapanese = locale === "ja";

  if (!Object.keys(CATEGORY_MAPPINGS).includes(slug)) {
    notFound();
  }

  const t = await getTranslations("CategoryPage");
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const targetCategories =
    CATEGORY_MAPPINGS[slug as keyof typeof CATEGORY_MAPPINGS];
  const tools = await getAllTools(locale);
  const filteredTools = filterToolList(
    tools.filter((tool) => targetCategories.includes(tool.category)),
  ).sort(sortToolsForEditorialLists);

  const title = t(`${slug}_title` as never);
  const description = t(`${slug}_description` as never);
  const landing = getCategoryLandingContent(
    slug,
    isJapanese ? "ja" : "en",
    title,
  );
  const featuredTools = filteredTools.slice(0, 5);
  const compareSlugs = featuredTools.slice(0, 3).map((tool) => tool.slug);
  const compareHref =
    compareSlugs.length >= 2 ? getComparisonHref(compareSlugs) : null;
  const verifiedCount = filteredTools.filter((tool) => tool.verified).length;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs(slug as never) },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const collectionSchema = generateCollectionPageSchema({
    name: title,
    description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/category/${slug}`,
    itemCount: filteredTools.length,
  });
  const faqSchema = generateFAQSchema(landing.faqs);

  const copy = isJapanese
    ? {
        badge: "カテゴリLP",
        compareTableTitle: "主要ツールの比較表",
        compareTableDescription:
          "評価、料金、検証状況、更新日をひと目で比較できるようにしました。詳細レビュー経由でCTAへ送客できます。",
        selectionTitle: "選び方のポイント",
        faqTitle: "よくある質問",
        toolCount: `${filteredTools.length}件の掲載`,
        verifiedCount: `${verifiedCount}件が確認済み`,
        compareCta: "このカテゴリを比較する",
        browseAllCta: "すべてのツールを見る",
        reviewLabel: "レビューを見る",
        visitLabel: "公式サイトへ",
        pricing: "料金",
        rating: "評価",
        verification: "検証",
        updated: "更新日",
        toolLabel: "ツール",
        actionLabel: "導線",
        statusVerified: "確認済み",
        statusPending: "要確認",
      }
    : {
        badge: "Category hub",
        compareTableTitle: "Compare the leading tools",
        compareTableDescription:
          "This summary table highlights rating, pricing, verification status, and update cadence before users click into the full review and CTA.",
        selectionTitle: "How to choose",
        faqTitle: "FAQ",
        toolCount: `${filteredTools.length} listed tools`,
        verifiedCount: `${verifiedCount} verified listings`,
        compareCta: "Compare this category",
        browseAllCta: "Browse all tools",
        reviewLabel: "Read review",
        visitLabel: "Visit site",
        pricing: "Pricing",
        rating: "Rating",
        verification: "Review status",
        updated: "Updated",
        toolLabel: "Tool",
        actionLabel: "Action",
        statusVerified: "Verified",
        statusPending: "Needs review",
      };

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                {copy.badge}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                {title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
              <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {landing.intro}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                  {copy.toolCount}
                </span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                  {copy.verifiedCount}
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {compareHref && (
                  <Link
                    href={compareHref}
                    className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {copy.compareCta}
                  </Link>
                )}
                <Link
                  href="/tools"
                  className="inline-flex items-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  {copy.browseAllCta}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {copy.selectionTitle}
              </h2>
              <ul className="mt-5 space-y-4">
                {landing.selectionPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <HeroSearchBar />
          </div>
        </section>

        <section className="mt-16">
          <DynamicAdUnit
            index={0}
            type="content"
            slot="content"
            forceShow={true}
            className="mb-10"
          />
          <div className="mx-auto mb-10 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {copy.compareTableTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {copy.compareTableDescription}
            </p>
            <div className="mt-6">
              <AffiliateDisclaimer variant="compact" />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {copy.toolLabel}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {copy.rating}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {copy.pricing}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {copy.verification}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {copy.updated}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {copy.actionLabel}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {featuredTools.map((tool) => (
                    <tr key={tool.slug} className="align-top">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {tool.title}
                        </div>
                        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {tool.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {tool.rating ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {formatPricingLabel(locale, tool.price, tool.pricing)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            tool.verified
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30"
                              : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30"
                          }`}
                        >
                          {tool.verified
                            ? copy.statusVerified
                            : copy.statusPending}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {formatUpdatedDate(tool.last_updated, locale)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                          >
                            {copy.reviewLabel}
                          </Link>
                          <AffiliateLinkButton
                            href={tool.affiliate_link}
                            toolSlug={tool.slug}
                            toolName={tool.title}
                            position="category_compare_table"
                            className="text-xs font-semibold text-green-600 hover:text-green-500 dark:text-green-400"
                          >
                            {copy.visitLabel}
                          </AffiliateLinkButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {copy.faqTitle}
          </h2>
          <div className="mt-8 grid gap-4">
            {landing.faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <ToolGrid tools={filteredTools} hideSearch={true} priority={true} />
        </section>
      </div>
    </div>
  );
}
