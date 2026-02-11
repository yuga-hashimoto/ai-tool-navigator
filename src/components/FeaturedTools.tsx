"use client";

import { ToolMetadata } from '@/lib/tools';
import { Link } from '@/i18n/routing';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface FeaturedToolsProps {
  tools: ToolMetadata[];
}

export function FeaturedTools({ tools }: FeaturedToolsProps) {
  const promotedTools = tools.filter((tool) => tool.promoted);
  const t = useTranslations('FeaturedTools');

  if (promotedTools.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500" />
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {promotedTools.map((tool) => (
          <div
            key={tool.slug}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-blue-500/10 p-[1px] hover:shadow-xl transition-all hover:scale-[1.01]"
          >
            <div className="relative h-full rounded-[23px] bg-white dark:bg-zinc-950 flex flex-col overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-colors z-0" />

              {tool.image && (
                <div className="relative h-48 w-full flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 z-10">
                   <Image
                      src={tool.image}
                      alt={tool.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                   />
                </div>
              )}

              <div className="flex flex-col flex-grow p-6 relative z-10">
                {/* Promoted Badge */}
                <div className="absolute top-6 right-6 z-20">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wide">
                    {t('promoted')}
                  </span>
                </div>

                <div className="relative z-10 mb-4">
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {tool.category}
                  </span>
                </div>

                <h3 className="relative z-10 text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  <Link href={`/tools/${tool.slug}`}>
                    <span className="absolute inset-0" />
                    {tool.title}
                  </Link>
                </h3>

                <p className="relative z-10 text-zinc-600 dark:text-zinc-400 mb-6 flex-grow line-clamp-2 text-lg">
                  {tool.description}
                </p>

                <div className="relative z-10 space-y-3 mb-8">
                  {tool.pros && tool.pros.slice(0, 3).map((pro, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>{pro}</span>
                      </div>
                  ))}
                </div>

                <div className="relative z-10 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-lg font-bold text-zinc-900 dark:text-white">{tool.rating}</span>
                      <span className="text-zinc-500 text-sm">/ 5.0</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {t('checkItOut')} &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
