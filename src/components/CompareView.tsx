"use client";

import { Link } from "@/i18n/routing";
import { ToolMetadata } from "@/lib/tools";
import { useCompare } from "@/context/CompareContext";
import { AlertTriangle, BadgeCheck, Check, ExternalLink, X } from "lucide-react";
import { Rating } from "@/components/Rating";
import { AffiliateLinkButton } from "@/components/AffiliateLinkButton";

interface CompareViewProps {
  tools: ToolMetadata[];
  locale: string;
}

function formatPricing(tool: ToolMetadata, locale: string): string {
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

  return tool.pricing ? labels[tool.pricing] : locale === "ja" ? "未掲載" : "Not listed";
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

export function CompareView({ tools, locale }: CompareViewProps) {
  const { selectedSlugs, removeTool } = useCompare();
  const copy = locale === "ja"
    ? {
        emptyTitle: "比較するツールが選択されていません",
        emptyDescription: "カテゴリページやツールページから比較候補を追加してください。",
        browseTools: "ツールを探す",
        viewDetails: "詳細を見る",
        rating: "評価",
        pricing: "料金",
        verification: "検証状況",
        updated: "更新日",
        description: "概要",
        pros: "メリット",
        cons: "注意点",
        website: "公式サイト",
        visitSite: "サイトへ移動",
        verified: "確認済み",
        pending: "要確認",
      }
    : {
        emptyTitle: "No tools selected for comparison",
        emptyDescription: "Add tools from category pages or tool pages to start comparing.",
        browseTools: "Browse tools",
        viewDetails: "View details",
        rating: "Rating",
        pricing: "Pricing",
        verification: "Review status",
        updated: "Updated",
        description: "Description",
        pros: "Pros",
        cons: "Considerations",
        website: "Official site",
        visitSite: "Visit site",
        verified: "Verified",
        pending: "Needs review",
      };

  const selectedTools = selectedSlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is ToolMetadata => tool !== undefined);

  if (selectedTools.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {copy.emptyTitle}
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {copy.emptyDescription}
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {copy.browseTools}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-12">
      <div className="min-w-[960px]">
        <div
          className="grid gap-0 border-collapse"
          style={{ gridTemplateColumns: `220px repeat(${selectedTools.length}, minmax(260px, 1fr))` }}
        >
          <div className="sticky left-0 z-10 bg-white p-4 border-b border-r border-zinc-200 dark:bg-black dark:border-zinc-800">
            <span className="sr-only">Features</span>
          </div>
          {selectedTools.map((tool) => (
            <div key={tool.slug} className="relative border-b border-zinc-200 p-4 text-center dark:border-zinc-800">
              <button
                onClick={() => removeTool(tool.slug)}
                className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Remove tool"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">{tool.title}</h3>
              <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                {tool.category}
              </div>
              <div className="mt-4">
                <Link href={`/tools/${tool.slug}`} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {copy.viewDetails}
                </Link>
              </div>
            </div>
          ))}

          <div className="sticky left-0 z-10 flex items-center border-b border-r border-zinc-200 bg-zinc-50 p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
            {copy.rating}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-rating`} className="flex items-center justify-center border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <Rating rating={tool.rating} size="h-5 w-5" textClassName="text-lg font-bold text-zinc-900 dark:text-zinc-100" />
            </div>
          ))}

          <div className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-white p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
            {copy.pricing}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-pricing`} className="border-b border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {formatPricing(tool, locale)}
            </div>
          ))}

          <div className="sticky left-0 z-10 flex items-center border-b border-r border-zinc-200 bg-zinc-50 p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
            {copy.verification}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-verification`} className="border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              {tool.verified ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30">
                  <BadgeCheck className="h-4 w-4" />
                  {copy.verified}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30">
                  <AlertTriangle className="h-4 w-4" />
                  {copy.pending}
                </div>
              )}
            </div>
          ))}

          <div className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-white p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
            {copy.updated}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-updated`} className="border-b border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {formatUpdatedDate(tool.last_updated, locale)}
            </div>
          ))}

          <div className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-zinc-50 p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
            {copy.description}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-desc`} className="border-b border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              {tool.description}
            </div>
          ))}

          <div className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-white p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
            {copy.pros}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-pros`} className="border-b border-zinc-200 p-4 align-top dark:border-zinc-800">
              <ul className="space-y-2">
                {tool.pros?.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-zinc-50 p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100">
            {copy.cons}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-cons`} className="border-b border-zinc-200 bg-zinc-50 p-4 align-top dark:border-zinc-800 dark:bg-zinc-900/50">
              <ul className="space-y-2">
                {tool.cons?.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sticky left-0 z-10 border-r border-zinc-200 bg-white p-4 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
            {copy.website}
          </div>
          {selectedTools.map((tool) => (
            <div key={`${tool.slug}-link`} className="flex items-center justify-center p-4">
              <AffiliateLinkButton
                href={tool.affiliate_link}
                toolSlug={tool.slug}
                toolName={tool.title}
                position="compare_table"
                className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all transform hover:scale-105"
              >
                {copy.visitSite}
                <ExternalLink className="ml-2 h-4 w-4" />
              </AffiliateLinkButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
