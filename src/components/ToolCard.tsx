"use client";

import { Link } from '@/i18n/routing';
import { Star } from 'lucide-react';
import { ToolMetadata } from '@/lib/tools';
import { cn } from '@/lib/utils';
import { useCompare } from '@/context/CompareContext';
import { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function ToolCard({ tool }: { tool: ToolMetadata }) {
  const { selectedSlugs, toggleTool } = useCompare();
  const isSelected = selectedSlugs.includes(tool.slug);
  const t = useTranslations('ToolCard');

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
                  <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.rating}</span>
                  </div>
              </div>
          </div>
          <div className="mt-4">
              <h3 className="text-lg font-semibold leading-6 text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  <Link href={`/tools/${tool.slug}`}>
                      <span className="absolute inset-0" />
                      {tool.title}
                  </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {tool.description}
              </p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
          {t('readMore')} <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  );
}
