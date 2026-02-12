"use client";

import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';

interface SponsoredToolsProps {
  tools: ToolMetadata[];
}

export function SponsoredTools({ tools }: SponsoredToolsProps) {
  const sponsoredTools = tools.filter((tool) => tool.sponsored);
  const t = useTranslations('SponsoredTools');

  if (sponsoredTools.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sponsoredTools.map((tool, index) => (
          <div key={tool.slug} className="flex flex-col h-full">
            <ToolCard tool={tool} priority={index < 3} />
          </div>
        ))}
      </div>
    </div>
  );
}
