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
  const bestForLabel = tool.pros?.[0] ?? tool.description;

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
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-500 dark:ring-amber-400/20">
                      {t('featured')}
                  </span>
                  )}
                  {tool.discount && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-400/10 dark:text-green-500 dark:ring-green-400/20">
                      {tool.discount}
                    </span>
                  )}
                  {tool.pricing && (
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      tool.pricing === 'free'
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/30"
                        : tool.pricing === 'freemium'
                        ? "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/30"
                        : tool.pricing === 'paid'
                        ? "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/30"
                        : "bg-zinc-50 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/30"
                    )}>
                      {t(`pricing_${tool.pricing}`)}
                    </span>
                  )}
                  {tool.is_fallback && locale === 'ja' && (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                      {fallbackLabel}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-3">
                  <button
                      onClick={handleCompareClick}
                      className={cn(
                          "relative z-20 flex items-center gap-1.5 text-xs font-medium transition-colors rounded px-2 py-1",
                          isSelected
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      )}
                  >
                      {isSelected ? t('selected') : t('compare')}
                  </button>
                  <Rating rating={tool.rating} compact={true} />
              </div>
          </div>
          <div className="mt-4">
              <h3 className="text-lg font-semibold leading-6 text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  <Link href={`/tools/${tool.slug}`} onClick={() => trackClick()}>
                      <span className="absolute inset-0" />
                      {tool.title}
                  </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {tool.description}
              </p>
              <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{t('bestFor')}:</span>{' '}
                <span className="line-clamp-2">{bestForLabel}</span>
              </div>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
          {t('readMore')} <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  );
}
