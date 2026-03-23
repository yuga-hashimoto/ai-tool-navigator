import { getAllTools, getToolOfTheWeek } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolCard } from "@/components/ToolCard";
import { FeaturedTools } from "@/components/FeaturedTools";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { SponsoredTools } from "@/components/SponsoredTools";
import { TopPicks } from "@/components/TopPicks";
import { ToolOfTheWeek } from "@/components/ToolOfTheWeek";
import { HeroSearchBar } from "@/components/HeroSearchBar";
import { Link } from "@/i18n/routing";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Metadata } from "next";
import { generatePlatformSchema } from "@/lib/schema";
import { CATEGORY_MAPPINGS } from "@/lib/categories";
import { DynamicAdUnit } from "@/components/DynamicAdUnit";
import {
  filterToolList,
  shouldShowToolInEditorialLists,
  sortToolsForEditorialLists,
} from "@/lib/editorial";
import { getComparisonHref } from "@/lib/compare-pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: `${t("title")} | AI Tool Navigator`,
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: `${t("title")} | AI Tool Navigator`,
      description: t("description"),
      type: "website",
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("title")} | AI Tool Navigator`,
      description: t("description"),
    },
  };
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { search } = await searchParams;
  const hasSearch = !!search;
  const isJapanese = locale === "ja";

  const t = await getTranslations("HomePage");
  const tCategory = await getTranslations({ locale, namespace: "CategoryPage" });
  const tBreadcrumbs = await getTranslations({ locale, namespace: "Breadcrumbs" });

  const rawTools = await getAllTools(locale);
  const visibleTools = filterToolList(rawTools);
  const rawToolOfTheWeek = await getToolOfTheWeek(locale);
  const toolOfTheWeek =
    rawToolOfTheWeek && shouldShowToolInEditorialLists(rawToolOfTheWeek)
      ? rawToolOfTheWeek
      : null;

  const topPicks = [...visibleTools]
    .filter((tool) => !tool.sponsored && !tool.promoted && !tool.featured && tool.slug !== toolOfTheWeek?.slug)
    .sort(sortToolsForEditorialLists)
    .slice(0, 6);

  const featuredCategorySlugs: Array<keyof typeof CATEGORY_MAPPINGS> = [
    "coding",
    "video",
    "writing",
    "marketing",
    "llm",
    "search",
  ];

  const categoryCards = featuredCategorySlugs.map((slug) => ({
    slug,
    label: tBreadcrumbs(slug as never),
    description: tCategory(`${slug}_description` as never),
    toolCount: visibleTools.filter((tool) => CATEGORY_MAPPINGS[slug].includes(tool.category)).length,
  }));

  const comparisonCandidates = [...visibleTools].sort(sortToolsForEditorialLists).slice(0, 6);
  const comparePresetSlugs = comparisonCandidates.slice(0, 3).map((tool) => tool.slug);

  const compareHref = getComparisonHref(
    comparePresetSlugs.length >= 2 ? comparePresetSlugs : ["chatgpt", "claude", "cursor"]
  );

  const platformSchema = generatePlatformSchema(t("description"), locale);
  const copy = isJapanese
    ? {
        compareTitle: "比較ページから主要ツールをすぐ見比べる",
        compareDescription:
          "レビュー保留中の怪しい名称を前面に出すのではなく、現在のナビゲーションでは主要ツールの比較導線を優先しています。",
        comparePrimaryCta: "比較を始める",
        compareSecondaryCta: "カテゴリを見る",
        categoryTitle: "カテゴリから探す",
        categoryDescription:
          "日本語のカテゴリLPを起点に、比較ページと詳細レビューへ自然につながる構成へ整理しました。",
        featuredComparisonsTitle: "人気の比較から始める",
        featuredComparisonsDescription: "定番ツールの比較ページを優先表示して、最短で候補を絞り込めるようにしました。",
        browseAllTools: "すべてのツールを見る",
        toolCountLabel: (count: number) => `${count}件掲載`,
      }
    : {
        compareTitle: "Start with a cleaner comparison hub",
        compareDescription:
          "Instead of surfacing speculative brand names, the main navigation now pushes visitors toward category hubs and practical tool comparisons.",
        comparePrimaryCta: "Start comparing",
        compareSecondaryCta: "Browse categories",
        categoryTitle: "Browse by category",
        categoryDescription:
          "Each category hub links cleanly into comparison pages and detailed reviews, which is better for both SEO and user intent.",
        featuredComparisonsTitle: "Start with popular comparisons",
        featuredComparisonsDescription: "We highlight practical head-to-head pages first so visitors can narrow options faster.",
        browseAllTools: "Browse all tools",
        toolCountLabel: (count: number) => `${count} tools`,
      };

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(platformSchema) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("description")}
          </p>
          <HeroSearchBar />
        </div>

        {!hasSearch && (
          <>
            <div className="mb-16 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isJapanese ? "比較導線を優先" : "Cleaner comparison path"}
                </span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {copy.compareTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  {copy.compareDescription}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={compareHref}
                    className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {copy.comparePrimaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/tools"
                    className="inline-flex items-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  >
                    {copy.browseAllTools}
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {copy.categoryTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {copy.categoryDescription}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {categoryCards.slice(0, 4).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {category.label}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {copy.toolCountLabel(category.toolCount)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="/category/coding"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    {copy.compareSecondaryCta}
                  </Link>
                </div>
              </div>
            </div>

            <div className="mb-16 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {copy.featuredComparisonsTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {copy.featuredComparisonsDescription}
                  </p>
                </div>
                <Link
                  href={compareHref}
                  className="hidden sm:inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  {copy.comparePrimaryCta}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {comparisonCandidates.slice(0, 3).map((tool) => {
                  const relatedSlugs = comparisonCandidates
                    .filter((candidate) => candidate.slug !== tool.slug)
                    .slice(0, 2)
                    .map((candidate) => candidate.slug);
                  const href = getComparisonHref([tool.slug, ...relatedSlugs]);

                  return (
                    <Link
                      key={tool.slug}
                      href={href}
                      className="group rounded-3xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                          {tool.category}
                        </span>
                        <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {tool.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 line-clamp-3">
                        {tool.description}
                      </p>
                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {isJapanese ? '比較ページへ' : 'Open comparison'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <DynamicAdUnit
              index={0}
              type="content"
              slot="content"
              className="mb-16"
            />

            <div className="mb-16">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {copy.categoryTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {copy.categoryDescription}
                  </p>
                </div>
                <Link
                  href="/tools"
                  className="hidden sm:inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  {copy.browseAllTools}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryCards.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {category.label}
                      </h3>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {copy.toolCountLabel(category.toolCount)}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {category.description}
                    </p>
                    <div className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400">
                      {isJapanese ? "カテゴリLPへ" : "Open category hub"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <ToolOfTheWeek tool={toolOfTheWeek} />
            <TopPicks tools={topPicks} />
            <FeaturedTools tools={visibleTools} />
            <FeaturedCarousel tools={visibleTools} />
            <SponsoredTools tools={visibleTools} />
          </>
        )}

        <Suspense fallback={<div className="py-12 text-center">Loading tools...</div>}>
          <ToolGrid tools={visibleTools} hideSearch={hasSearch} priority={hasSearch} />
        </Suspense>
      </div>
    </div>
  );
}
