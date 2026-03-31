"use client";

import { ToolMetadata } from "@/lib/tools";
import { Link } from "@/i18n/routing";
import { Check, X, ExternalLink } from "lucide-react";
import { Rating } from "@/components/Rating";
import { AffiliateLinkButton } from "@/components/AffiliateLinkButton";

interface ComparisonTableProps {
  tools: ToolMetadata[];
}

export function ComparisonTable({ tools }: ComparisonTableProps) {
  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[800px]">
            <div
                className="grid gap-0 border-collapse"
                style={{ gridTemplateColumns: `200px repeat(${tools.length}, minmax(250px, 1fr))` }}
            >
                {/* Header Row: Tool Names & Categories */}
                <div className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                    Tool
                </div>
                {tools.map((tool) => (
                    <div key={tool.slug} className="p-4 border-b border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50 dark:bg-zinc-900/50">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{tool.title}</h3>
                        <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                            {tool.category}
                        </div>
                    </div>
                ))}

                {/* Rating Row */}
                <div className="sticky left-0 z-10 bg-white dark:bg-black p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                    Rating
                </div>
                {tools.map((tool) => (
                    <div key={`${tool.slug}-rating`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-center items-center bg-white dark:bg-black">
                         <Rating rating={tool.rating} size="h-5 w-5" textClassName="text-lg font-bold text-zinc-900 dark:text-zinc-100" />
                    </div>
                ))}

                 {/* Description Row */}
                <div className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Description
                </div>
                {tools.map((tool) => (
                    <div key={`${tool.slug}-desc`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50">
                        {tool.description}
                    </div>
                ))}

                 {/* Pros Row */}
                <div className="sticky left-0 z-10 bg-white dark:bg-black p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Pros
                </div>
                {tools.map((tool) => (
                    <div key={`${tool.slug}-pros`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 align-top bg-white dark:bg-black">
                        <ul className="space-y-2">
                            {tool.pros?.map((pro, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                 {/* Cons Row */}
                <div className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Cons
                </div>
                {tools.map((tool) => (
                    <div key={`${tool.slug}-cons`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 align-top bg-zinc-50 dark:bg-zinc-900/50">
                         <ul className="space-y-2">
                            {tool.cons?.map((con, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Link Row */}
                 <div className="sticky left-0 z-10 bg-white dark:bg-black p-4 border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                    Link
                </div>
                {tools.map((tool) => (
                    <div key={`${tool.slug}-link`} className="p-4 bg-white dark:bg-black flex flex-col justify-center items-center gap-2">
                        <AffiliateLinkButton
                            href={tool.affiliate_link}
                            toolSlug={tool.slug}
                            toolName={tool.title}
                            position="comparison_table"
                            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Visit Site
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </AffiliateLinkButton>
                        <Link href={`/tools/${tool.slug}`} className="text-xs text-zinc-500 hover:text-zinc-700 underline dark:hover:text-zinc-300">
                            Read Review
                        </Link>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
