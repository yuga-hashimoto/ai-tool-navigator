import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { AffiliateLinkButton } from "@/components/AffiliateLinkButton";
import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";
import { DynamicAdUnit } from "@/components/DynamicAdUnit";
import { getAllTools, ToolMetadata } from "@/lib/tools";
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import { getComparePresetBySlug, parseComparisonSlug } from "@/lib/compare-pages";
import { getEditorialToolStatus, isReviewPendingToolSlug } from "@/lib/editorial";
import { Link } from "@/i18n/routing";
import { ExternalLink } from "lucide-react";

interface PageParams {
  locale: string;
  comparisonSlug: string;
}

function formatPricing(
  locale: string,
  tool: Pick<ToolMetadata, "price" | "pricing">
): string {
  if (tool.price) {
    return tool.price;
  }

  const labels = locale === "ja"
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

  return tool.pricing ? labels[tool.pricing] : locale === "ja" ? "Not listed" : "Not listed";
}

function formatUpdated(locale: string, value?: string): string {
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

async function resolveTools(locale: string, comparisonSlug: string): Promise<ToolMetadata[]> {
  const allTools = await getAllTools(locale);
  const slugs = parseComparisonSlug(comparisonSlug);
  const tools = slugs
    .map((slug) => allTools.find((tool) => tool.slug === slug))
    .filter((tool): tool is ToolMetadata => tool !== undefined);

  return tools;
}

export async function generateStaticParams() {
  const { COMPARE_PRESETS } = await import("@/lib/compare-pages");
  return ["en", "ja"].flatMap((locale) =>
    COMPARE_PRESETS.map((preset) => ({
      locale,
      comparisonSlug: preset.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, comparisonSlug } = await params;
  const tools = await resolveTools(locale, comparisonSlug);

  if (tools.length < 2) {
    return {
      title: "Comparison Not Found",
    };
  }

  const preset = getComparePresetBySlug(comparisonSlug);
  const title =
    preset?.title[locale === "ja" ? "ja" : "en"] ||
    tools.map((tool) => tool.title).join(" vs ");
  const description =
    preset?.description[locale === "ja" ? "ja" : "en"] ||
    (locale === "ja"
      ? `${tools.map((tool) => tool.title).join(" / ")} を横並びで比較します。`
      : `Compare ${tools.map((tool) => tool.title).join(", ")} side by side.`);
  const noIndex = tools.some((tool) => isReviewPendingToolSlug(tool.slug));

  return {
    title: `${title} | AI Tool Navigator`,
    description,
    alternates: {
      canonical: `/${locale}/compare/${comparisonSlug}`,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export default async function CompareTemplatePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, comparisonSlug } = await params;
  const isJapanese = locale === "ja";
  const tools = await resolveTools(locale, comparisonSlug);

  if (tools.length < 2) {
    notFound();
  }

  const preset = getComparePresetBySlug(comparisonSlug);
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const localizedTitle =
    preset?.title[isJapanese ? "ja" : "en"] ||
    tools.map((tool) => tool.title).join(" vs ");
  const localizedDescription =
    preset?.description[isJapanese ? "ja" : "en"] ||
    (isJapanese
      ? `${tools.map((tool) => tool.title).join(" / ")} の価格、評価、検証状況を比較します。`
      : `Compare pricing, ratings, and editorial status for ${tools.map((tool) => tool.title).join(", ")}.`);
  const localizedIntro =
    preset?.intro[isJapanese ? "ja" : "en"] ||
    (isJapanese
      ? "この比較ページはカテゴリLPから直接送客できるテンプレートです。"
      : "This comparison page is generated from the reusable comparison template used across category hubs.");

  const faqs =
    preset?.faqs.map((faq) => ({
      question: faq.question[isJapanese ? "ja" : "en"],
      answer: faq.answer[isJapanese ? "ja" : "en"],
    })) || [];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("compare"), href: "/compare" },
    { label: localizedTitle },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, locale);
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
  const copy = isJapanese
    ? {
        rating: "評価",
        pricing: "料金",
        status: "検証状況",
        updated: "更新日",
        review: "詳細レビュー",
        visit: "公式サイトへ",
        reviewed: "確認済み",
        pending: "要確認",
        archived: "索引対象外",
        faqTitle: "よくある質問",
      }
    : {
        rating: "Rating",
        pricing: "Pricing",
        status: "Editorial status",
        updated: "Updated",
        review: "Read review",
        visit: "Visit site",
        reviewed: "Reviewed",
        pending: "Pending review",
        archived: "Excluded from index",
        faqTitle: "FAQ",
      };

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {localizedTitle}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {localizedDescription}
          </p>
          <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {localizedIntro}
          </p>
        </div>

        <div className="mx-auto mb-10 max-w-3xl">
          <AffiliateDisclaimer variant="compact" />
        </div>

        <DynamicAdUnit
          index={0}
          type="content"
          slot="content"
          forceShow={true}
          className="mb-10"
        />

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900/70">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Tool
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {copy.rating}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {copy.pricing}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {copy.status}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {copy.updated}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tools.map((tool) => {
                  const status = getEditorialToolStatus(tool);
                  const statusLabel =
                    status === "reviewed"
                      ? copy.reviewed
                      : status === "pending_review"
                      ? copy.pending
                      : copy.archived;

                  return (
                    <tr key={tool.slug}>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{tool.title}</div>
                        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{tool.description}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-zinc-700 dark:text-zinc-300">{tool.rating}</td>
                      <td className="px-6 py-5 text-sm text-zinc-700 dark:text-zinc-300">{formatPricing(locale, tool)}</td>
                      <td className="px-6 py-5 text-sm text-zinc-700 dark:text-zinc-300">{statusLabel}</td>
                      <td className="px-6 py-5 text-sm text-zinc-700 dark:text-zinc-300">{formatUpdated(locale, tool.last_updated)}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap items-center justify-end gap-4">
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline-offset-4 hover:underline py-2"
                          >
                            {copy.review}
                          </Link>
                          <AffiliateLinkButton
                            href={tool.affiliate_link}
                            toolSlug={tool.slug}
                            toolName={tool.title}
                            position={`compare_template_${comparisonSlug}`}
                            className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
                          >
                            {copy.visit}
                            <ExternalLink className="-mr-0.5 ml-2 h-4 w-4" aria-hidden="true" />
                          </AffiliateLinkButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {copy.faqTitle}
            </h2>
            <div className="mt-6 grid gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
