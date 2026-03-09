"use client";

import { Link } from '@/i18n/routing';
import { ToolMetadata } from '@/lib/tools';
import { cn } from '@/lib/utils';
import { Rating } from '@/components/Rating';
import { useCompare } from '@/context/CompareContext';
import { MouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useProductTracking } from '@/hooks/useProductTracking';

export function ToolCard({ tool, priority }: { tool: ToolMetadata; priority?: boolean }) {
  const { selectedSlugs, toggleTool } = useCompare();
  const { trackClick } = useProductTracking(tool.slug);
  const isSelected = selectedSlugs.includes(tool.slug);
  const t = useTranslations('ToolCard');
  const locale = useLocale();
  const fallbackLabel = locale === 'ja' ? '英語ソース' : 'English source';

  const handleCompareClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTool(tool.slug);
  };

  return (
    <div className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900/50 dark:hover:bg-zinc-900",
        isSelected
          ? "border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400"
          : tool.sponsored
          ? "border-amber-400 ring-1 ring-amber-400/50 dark:border-amber-500 dark:ring-amber-500/50 bg-amber-50/30 dark:bg-amber-900/10"
          : "border-zinc-200 dark:border-zinc-800"
    )}>
      {tool.image && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={tool.image}
            alt={tool.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col justify-between flex-grow p-6">
        <div>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                  {tool.category}
                  </span>
                  {tool.sponsored && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-500 dark:ring-amber-400/20 uppercase tracking-wide">
                      {t('sponsored')}
                    </span>
                  )}
                  {tool.featured && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/30">
                    {t('featured')}
                  </span>
                  )}
              </div>
              <button
                onClick={handleCompareClick}
                className={cn(
                  "flex-shrink-0 rounded-full p-1.5 transition-colors",
                  isSelected
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400"
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                )}
                title={isSelected ? t('removeFromCompare') : t('addToCompare')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
          </div>
          <Link href={`/tools/${tool.slug}`} onClick={() => trackClick()} className="block mt-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
              {tool.description}
            </p>
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          <Rating rating={tool.rating} />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {tool.pricing}
            </span>
            {tool.is_fallback && locale === 'ja' && (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {fallbackLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
