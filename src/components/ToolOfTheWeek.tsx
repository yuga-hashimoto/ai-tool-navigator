"use client";

import { ToolMetadata } from '@/lib/tools';
import { Link } from '@/i18n/routing';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Rating } from '@/components/Rating';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface ToolOfTheWeekProps {
  tool: ToolMetadata | null;
}

export function ToolOfTheWeek({ tool }: ToolOfTheWeekProps) {
  const t = useTranslations('HomePage');
  const tFeatured = useTranslations('FeaturedTools');

  if (!tool) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-6 w-6 text-purple-500 fill-purple-500" />
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('toolOfTheWeek')}
        </h2>
      </div>

      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 p-[1px] shadow-lg hover:shadow-xl transition-all hover:scale-[1.005]">
        <div className="relative h-full rounded-[23px] bg-white dark:bg-zinc-950 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">

            {/* Background Glow */}
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-colors" />
            <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl group-hover:bg-orange-500/20 transition-colors" />

            <div className="flex-1 z-10">
                <div className="mb-4">
                    <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {tool.category}
                    </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
                    <Link href={`/tools/${tool.slug}`} className="hover:underline decoration-purple-500/30 underline-offset-4">
                        {tool.title}
                    </Link>
                </h3>

                <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed max-w-2xl">
                    {tool.description}
                </p>

                <div className="mb-8">
                     <Rating rating={tool.rating} size="h-5 w-5" textClassName="text-lg font-bold text-zinc-900 dark:text-white" />
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
                    {tool.pros && tool.pros.slice(0, 3).map((pro, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        {pro}
                    </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-4">
                    <Link
                        href={`/tools/${tool.slug}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                        {tFeatured('viewDetails')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <span className="inline-flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-900 dark:text-white">
                        {tool.pricing}
                    </span>
                </div>
            </div>

            {/* Image */}
            {tool.image && (
                <div className="hidden md:block relative w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
                    <Image
                        src={tool.image}
                        alt={tool.title}
                        fill
                        sizes="(max-width: 768px) 0px, 192px"
                        priority={true}
                        className="object-cover"
                    />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
