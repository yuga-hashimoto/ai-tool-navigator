"use client";

import { ToolMetadata } from '@/lib/tools';
import { Link } from '@/i18n/routing';
import { Zap, ArrowRight } from 'lucide-react';
import { Rating } from '@/components/Rating';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface ToolOfTheWeekSidebarProps {
  tool: ToolMetadata | null;
}

export function ToolOfTheWeekSidebar({ tool }: ToolOfTheWeekSidebarProps) {
  const t = useTranslations('HomePage');
  const tFeatured = useTranslations('FeaturedTools');

  if (!tool) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-purple-500 fill-purple-500" />
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          {t('toolOfTheWeek')}
        </h3>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-4">
        {tool.image ? (
            <Image
                src={tool.image}
                alt={tool.title}
                fill
                className="object-cover"
            />
        ) : (
             <div className="flex h-full items-center justify-center text-zinc-400 font-bold text-2xl">
                {tool.title.substring(0, 2)}
             </div>
        )}
      </div>

      <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
        <Link href={`/tools/${tool.slug}`} className="hover:text-purple-600 transition-colors">
            {tool.title}
        </Link>
      </h4>

      <div className="mb-3">
         <Rating rating={tool.rating} size="h-4 w-4" textClassName="text-sm font-medium text-zinc-700 dark:text-zinc-300" />
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
        {tool.description}
      </p>

      <Link
        href={`/tools/${tool.slug}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {tFeatured('checkItOut')} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
