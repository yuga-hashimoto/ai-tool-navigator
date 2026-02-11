"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ToolMetadata } from '@/lib/tools';
import { Link } from '@/i18n/routing';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FeaturedCarouselProps {
  tools: ToolMetadata[];
}

export function FeaturedCarousel({ tools }: FeaturedCarouselProps) {
  const featuredTools = tools.filter((tool) => tool.featured);
  const t = useTranslations('FeaturedCarousel');
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  if (featuredTools.length === 0) {
    return null;
  }

  return (
    <div className="mb-16 relative">
        <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-indigo-500 fill-indigo-500" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t('title')}
            </h2>
        </div>
      <div className="overflow-hidden -mx-4 px-4 py-4" ref={emblaRef}>
        <div className="flex -ml-6">
          {featuredTools.map((tool, index) => (
            <div key={tool.slug} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6">
               <Link href={`/tools/${tool.slug}`} className="block h-full group">
                 <div className="relative h-full overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-800 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-zinc-800/50">

                    {/* Background Gradients */}
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${
                        index % 3 === 0 ? 'from-blue-500 via-purple-500 to-pink-500' :
                        index % 3 === 1 ? 'from-emerald-500 via-teal-500 to-cyan-500' :
                        'from-orange-500 via-amber-500 to-yellow-500'
                    }`} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
                                {tool.category}
                            </span>
                            <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-white">{tool.rating}</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
                            {tool.title}
                        </h3>

                        <p className="text-zinc-300 text-sm line-clamp-3 mb-6 flex-grow">
                            {tool.description}
                        </p>

                        <div className="flex items-center text-sm font-semibold text-white/90 group-hover:text-white mt-auto">
                            {t('viewDeal')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                 </div>
               </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
