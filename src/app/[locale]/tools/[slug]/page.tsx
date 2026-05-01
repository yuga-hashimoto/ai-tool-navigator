import { getAllTools, getToolBySlug, getToolSlugs } from "@/lib/tools";
import { getRelatedPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkYoutube } from "@/lib/remark-youtube";
import { ExternalLink, BadgeCheck, Calendar, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { Rating } from "@/components/Rating";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import {
  generateProductSchema,
  generateToolSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";
import { ProsConsSection } from "@/components/ProsConsSection";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { MarkdownImage } from "@/components/MarkdownImage";
import { getCategorySlug } from "@/lib/breadcrumbs";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ShareButtons } from "@/components/ShareButtons";
import { AffiliateLinkButton } from "@/components/AffiliateLinkButton";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";
import { ProductTracker } from "@/components/ProductTracker";
import { RecommendedTools } from "@/components/RecommendedTools";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import type { Components } from "react-markdown";
import {
  filterPostList,
  filterToolList,
  getEditorialToolStatus,
  isReviewPendingToolSlug,
  sortToolsForEditorialLists,
} from "@/lib/editorial";
import { getComparisonHref } from "@/lib/compare-pages";
import { getContentSyncSummary } from "@/lib/content-sync";
import { DynamicAdUnit } from "@/components/DynamicAdUnit";

export async function generateStaticParams() {
  const slugs = getToolSlugs();
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const tool = await getToolBySlug(slug, locale);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  const title = `${tool.metadata.title} - AI Tool Navigator`;
  const description = tool.metadata.description;
  const reviewPending = isReviewPendingToolSlug(slug);

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/tools/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${locale}/tools/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: reviewPending
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
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
          free: "\u7121\u6599",
          freemium: "\u30D5\u30EA\u30FC\u30DF\u30A2\u30E0",
          paid: "\u6709\u6599",
          contact: "\u8981\u554F\u3044\u5408\u308F\u305B",
        }
      : {
          free: "Free",
          freemium: "Freemium",
          paid: "Paid",
          contact: "Contact sales",
        };

  return pricing
    ? labels[pricing]
    : locale === "ja"
      ? "\u672A\u63B2\u8F09"
      : "Not listed";
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const isJapanese = locale === "ja";
  const tool = await getToolBySlug(slug, locale);
  const t = await getTranslations("ToolPage");
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const tShare = await getTranslations("ShareButtons");

  if (!tool) {
    notFound();
  }

  const { metadata, content } = tool;
  const { verified, last_updated } = metadata;
  const relatedPosts = filterPostList(
    await getRelatedPosts(metadata, 3, locale),
  ).slice(0, 3);
  const toolSchema = generateToolSchema(tool);
  const productSchema = generateProductSchema(tool);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/tools/${slug}`;

  const categorySlug = getCategorySlug(metadata.category);
  const allTools = filterToolList(await getAllTools(locale));
  const compareCandidates = allTools
    .filter(
      (candidate) =>
        candidate.category === metadata.category && candidate.slug !== slug,
    )
    .sort(sortToolsForEditorialLists)
    .slice(0, 3);

  const compareHref =
    !isReviewPendingToolSlug(slug) && compareCandidates.length >= 2
      ? getComparisonHref([
          slug,
          ...compareCandidates.map((candidate) => candidate.slug),
        ])
      : null;
  const syncSummary = getContentSyncSummary(slug);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
  ];

  if (categorySlug) {
    breadcrumbItems.push({
      label: tBreadcrumbs(categorySlug as never),
      href: `/category/${categorySlug}`,
    });
  }

  breadcrumbItems.push({ label: metadata.title });

  const components = {
    "youtube-embed": (props: ComponentProps<typeof YouTubeEmbed>) => (
      <YouTubeEmbed {...props} />
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <MarkdownImage src={src} alt={alt} />
    ),
  } as unknown as Components;

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, locale);
  const editorialStatus = getEditorialToolStatus(metadata);
  const copy = isJapanese
    ? {
        reviewTitle: "\u7DE8\u96C6\u30EC\u30D3\u30E5\u30FC\u60C5\u5831",
        reviewedHeadline:
          "\u3053\u306E\u63B2\u8F09\u306F\u78BA\u8A8D\u6E08\u307F\u3067\u3059",
        reviewedBody:
          "\u4E3B\u8981\u306A\u6A5F\u80FD\u3001\u30EA\u30F3\u30AF\u3001\u66F4\u65B0\u65E5\u3092\u78BA\u8A8D\u3057\u305F\u3046\u3048\u3067\u3001\u6BD4\u8F03\u30CF\u30D6\u3084\u30AB\u30C6\u30B4\u30EALP\u304B\u3089\u6848\u5185\u3057\u3066\u3044\u307E\u3059\u3002",
        pendingHeadline:
          "\u3053\u306E\u63B2\u8F09\u306F\u78BA\u8A8D\u5F85\u3061\u3067\u3059",
        pendingBody:
          "\u516C\u958B\u60C5\u5831\u3092\u5143\u306B\u63B2\u8F09\u3057\u3066\u3044\u307E\u3059\u3002\u4FA1\u683C\u3084\u6A5F\u80FD\u306F\u516C\u5F0F\u30B5\u30A4\u30C8\u3067\u5FC5\u305A\u518D\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
        archivedHeadline:
          "\u3053\u306E\u63B2\u8F09\u306F\u7D22\u5F15\u5BFE\u8C61\u5916\u3067\u3059",
        archivedBody:
          "\u540D\u79F0\u3084\u60C5\u5831\u306E\u4FE1\u983C\u6027\u306B\u78BA\u8A8D\u8AB2\u984C\u304C\u3042\u308B\u305F\u3081\u3001\u4E3B\u8981\u5C0E\u7DDA\u3068\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u304B\u3089\u306F\u5916\u3057\u3066\u3044\u307E\u3059\u3002\u53C2\u8003\u95B2\u89A7\u306E\u307F\u3092\u60F3\u5B9A\u3057\u3066\u3044\u307E\u3059\u3002",
        pricing: "\u6599\u91D1",
        platform: "\u5BFE\u5FDC\u74B0\u5883",
        status: "\u30B9\u30C6\u30FC\u30BF\u30B9",
        unknown: "\u672A\u63B2\u8F09",
        compareCategory:
          "\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u3092\u6BD4\u8F03",
        browseCategory: "\u30AB\u30C6\u30B4\u30EALP\u3092\u898B\u308B",
        verifiedLabel: "\u78BA\u8A8D\u6E08\u307F",
        pendingLabel: "\u8981\u78BA\u8A8D",
        archivedLabel: "\u7D22\u5F15\u5BFE\u8C61\u5916",
        disclosureLink: "\u5E83\u544A\u958B\u793A",
        policyLink: "\u7DE8\u96C6\u65B9\u91DD",
        syncTitle: "\u516C\u5F0F\u60C5\u5831\u306E\u76E3\u8996\u72B6\u6CC1",
        syncLastChecked: "\u6700\u7D42\u78BA\u8A8D",
        syncLastChanged: "\u5DEE\u5206\u691C\u77E5",
        syncNoData:
          "\u307E\u3060\u81EA\u52D5\u76E3\u8996\u306E\u30B9\u30CA\u30C3\u30D7\u30B7\u30E7\u30C3\u30C8\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
      }
    : {
        reviewTitle: "Editorial review",
        reviewedHeadline: "This listing has been reviewed",
        reviewedBody:
          "We surface this tool in our category hubs after checking core features, links, and update signals.",
        pendingHeadline: "This listing still needs review",
        pendingBody:
          "Use this page as a starting point, but confirm pricing and feature details on the official site before acting on them.",
        archivedHeadline:
          "This listing is excluded from indexed recommendations",
        archivedBody:
          "We keep the page available for reference, but it is removed from primary entry points until editorial review is complete.",
        pricing: "Pricing",
        platform: "Platforms",
        status: "Status",
        unknown: "Not listed",
        compareCategory: "Compare this category",
        browseCategory: "Open category hub",
        verifiedLabel: "Reviewed",
        pendingLabel: "Pending review",
        archivedLabel: "Excluded from index",
        disclosureLink: "Affiliate disclosure",
        policyLink: "Editorial policy",
        syncTitle: "Official source monitoring",
        syncLastChecked: "Last checked",
        syncLastChanged: "Last detected change",
        syncNoData: "No monitoring snapshot has been recorded yet.",
      };

  const statusLabel =
    editorialStatus === "reviewed"
      ? copy.verifiedLabel
      : editorialStatus === "pending_review"
        ? copy.pendingLabel
        : copy.archivedLabel;

  const statusHeadline =
    editorialStatus === "reviewed"
      ? copy.reviewedHeadline
      : editorialStatus === "pending_review"
        ? copy.pendingHeadline
        : copy.archivedHeadline;

  const statusBody =
    editorialStatus === "reviewed"
      ? copy.reviewedBody
      : editorialStatus === "pending_review"
        ? copy.pendingBody
        : copy.archivedBody;
  const fallbackNotice =
    isJapanese && metadata.is_fallback
      ? "\u3053\u306E\u30DA\u30FC\u30B8\u306F\u307E\u3060\u65E5\u672C\u8A9E\u7248\u304C\u306A\u3044\u305F\u3081\u3001\u672C\u6587\u306F\u82F1\u8A9E\u30BD\u30FC\u30B9\u3092\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002\u4E3B\u8981UI\u3068\u5C0E\u7DDA\u306F\u65E5\u672C\u8A9E\u5316\u3057\u3066\u3044\u307E\u3059\u3002"
      : null;

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <ProductTracker slug={slug} />
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-6">
          <AffiliateDisclaimer variant="compact" />
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-900/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="px-6 py-8 sm:px-12 sm:py-12 lg:px-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-x-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                      {metadata.title}
                    </h1>
                    {verified && (
                      <BadgeCheck
                        className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500"
                        aria-label="Verified Tool"
                      />
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                    {metadata.category}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Rating
                    rating={metadata.rating || 0}
                    size="h-5 w-5"
                    textClassName="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                  />
                  {last_updated && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {t("lastUpdated")}:{" "}
                        {new Date(last_updated).toLocaleDateString(
                          locale === "ja" ? "ja-JP" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <CopyLinkButton className="w-full sm:w-auto" />
                <AffiliateLinkButton
                  href={metadata.affiliate_link}
                  toolSlug={metadata.slug}
                  toolName={metadata.title}
                  position="hero_section"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-green-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all transform hover:scale-105"
                >
                  {t("tryThisTool")} <ExternalLink className="ml-2 h-4 w-4" />
                </AffiliateLinkButton>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
              {fallbackNotice && (
                <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  {fallbackNotice}
                </div>
              )}
              {syncSummary && (
                <div className="lg:col-span-2 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-zinc-600 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-zinc-300">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {copy.syncTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {syncSummary.summary || copy.syncNoData}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100 dark:bg-zinc-950 dark:ring-blue-900/50">
                      {copy.syncLastChecked}:{" "}
                      {syncSummary.lastCheckedAt
                        ? new Date(
                            syncSummary.lastCheckedAt,
                          ).toLocaleDateString(
                            locale === "ja" ? "ja-JP" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : copy.unknown}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100 dark:bg-zinc-950 dark:ring-blue-900/50">
                      {copy.syncLastChanged}:{" "}
                      {syncSummary.lastChangedAt
                        ? new Date(
                            syncSummary.lastChangedAt,
                          ).toLocaleDateString(
                            locale === "ja" ? "ja-JP" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : copy.unknown}
                    </span>
                  </div>
                  {syncSummary.highlights.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {syncSummary.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div
                className={cn(
                  "rounded-3xl border p-6",
                  editorialStatus === "reviewed"
                    ? "border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10"
                    : editorialStatus === "pending_review"
                      ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
                      : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950",
                )}
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {copy.reviewTitle}
                </h2>
                <p className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {statusHeadline}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {statusBody}
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <dl className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      {copy.status}
                    </dt>
                    <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {statusLabel}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      {copy.pricing}
                    </dt>
                    <dd className="text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPricingLabel(
                        locale,
                        metadata.price,
                        metadata.pricing,
                      )}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      {copy.platform}
                    </dt>
                    <dd className="text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {metadata.platform?.join(", ") || copy.unknown}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  {compareHref && (
                    <Link
                      href={compareHref}
                      className="inline-flex items-center group rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {copy.compareCategory}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                  {categorySlug && (
                    <Link
                      href={`/category/${categorySlug}`}
                      className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                    >
                      {copy.browseCategory}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <ProsConsSection
              pros={metadata.pros}
              cons={metadata.cons}
              labels={{
                title: t("prosConsTitle"),
                pros: t("pros"),
                cons: t("cons"),
              }}
            />

            {metadata.rating_breakdown && (
              <RatingBreakdown
                breakdown={metadata.rating_breakdown}
                title={t("ratingBreakdown")}
              />
            )}

            <DynamicAdUnit
              index={0}
              type="content"
              slot="content"
              forceShow={true}
              className="mt-10"
            />

            <div className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkDirective, remarkYoutube]}
                components={components}
              >
                {content}
              </ReactMarkdown>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {t("tryThisToolToday")}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {t("affiliateDisclaimer")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium">
                    <Link
                      href="/affiliate-disclosure"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {copy.disclosureLink}
                    </Link>
                    <Link
                      href="/editorial-policy"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {copy.policyLink}
                    </Link>
                  </div>
                </div>
                <AffiliateLinkButton
                  href={metadata.affiliate_link}
                  toolSlug={metadata.slug}
                  toolName={metadata.title}
                  position="content_cta"
                  className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all"
                >
                  {t("tryThisTool")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </AffiliateLinkButton>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                {tShare("shareThisTool")}
              </h3>
              <ShareButtons
                url={url}
                title={metadata.title}
                twitterText={tShare("twitterShareTool", {
                  toolName: metadata.title,
                })}
              />
            </div>
          </div>
        </div>

        <RecommendedTools currentSlug={slug} locale={locale} />

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              {t("relatedArticles")}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
