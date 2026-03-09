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
                        <span>{pro}</span>
                    </div>
                    ))}
                </div>

                <Link
                    href={`/tools/${tool.slug}`}
                    className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm"
                >
                    {tFeatured('checkItOut')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>

            {/* Visual element or large icon on the right for desktop */}
            <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-center overflow-hidden relative">
                 {tool.image ? (
                    <Image
                        src={tool.image}
                        alt={tool.title}
                        fill
                        sizes="(max-width: 768px) 0px, 192px"
                        priority={true}
                        className="object-cover"
                    />
                 ) : (
                    <span className="text-4xl font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{tool.title.substring(0, 2)}</span>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
}
