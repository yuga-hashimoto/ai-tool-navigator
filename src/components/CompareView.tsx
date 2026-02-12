"use client";

import { ToolMetadata } from "@/lib/tools";
import { useCompare } from "@/context/CompareContext";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Rating } from "@/components/Rating";
import { sendGAEvent } from "@/lib/analytics";

interface CompareViewProps {
  tools: ToolMetadata[];
}

export function CompareView({ tools }: CompareViewProps) {
  const { selectedSlugs, removeTool } = useCompare();

  // Filter tools based on selection
  const selectedTools = tools.filter((tool) => selectedSlugs.includes(tool.slug));

  if (selectedTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          No tools selected for comparison
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Go back to the homepage and select tools to compare.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          Browse Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-12">
        <div className="min-w-[800px]">
            <div 
                className="grid gap-0 border-collapse"
                style={{ gridTemplateColumns: `200px repeat(${selectedTools.length}, minmax(250px, 1fr))` }}
            >
                {/* Header Row: Tool Names & Images */}
                <div className="sticky left-0 z-10 bg-white dark:bg-black p-4 border-b border-r border-zinc-200 dark:border-zinc-800">
                    <span className="sr-only">Features</span>
                </div>
                {selectedTools.map((tool) => (
                    <div key={tool.slug} className="relative p-4 border-b border-zinc-200 dark:border-zinc-800 text-center">
                        <button
                            onClick={() => removeTool(tool.slug)}
                            className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            aria-label="Remove tool"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{tool.title}</h3>
                        <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                            {tool.category}
                        </div>
                         <div className="mt-4">
                            <Link href={`/tools/${tool.slug}`} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Rating Row */}
                <div className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                    Rating
                </div>
                {selectedTools.map((tool) => (
                    <div key={`${tool.slug}-rating`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-center items-center bg-zinc-50 dark:bg-zinc-900/50">
                         <Rating rating={tool.rating} size="h-5 w-5" textClassName="text-lg font-bold text-zinc-900 dark:text-zinc-100" />
                    </div>
                ))}

                 {/* Description Row */}
                <div className="sticky left-0 z-10 bg-white dark:bg-black p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Description
                </div>
                {selectedTools.map((tool) => (
                    <div key={`${tool.slug}-desc`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {tool.description}
                    </div>
                ))}

                 {/* Pros Row */}
                <div className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Pros
                </div>
                {selectedTools.map((tool) => (
                    <div key={`${tool.slug}-pros`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 align-top">
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
                <div className="sticky left-0 z-10 bg-white dark:bg-black p-4 border-b border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Cons
                </div>
                {selectedTools.map((tool) => (
                    <div key={`${tool.slug}-cons`} className="p-4 border-b border-zinc-200 dark:border-zinc-800 align-top">
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
                 <div className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Website
                </div>
                {selectedTools.map((tool) => (
                    <div key={`${tool.slug}-link`} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex justify-center items-center">
                        <a
                            href={tool.affiliate_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                            onClick={() => sendGAEvent("affiliate_click", {
                              tool_slug: tool.slug,
                              tool_name: tool.title,
                              position: "compare_table"
                            })}
                        >
                            Visit Site
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
