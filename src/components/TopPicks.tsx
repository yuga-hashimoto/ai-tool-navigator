"use client";

import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { useTranslations } from 'next-intl';
import { Trophy } from 'lucide-react';

interface TopPicksProps {
  tools: ToolMetadata[];
}

export function TopPicks({ tools }: TopPicksProps) {
  const t = useTranslations('TopPicks');

  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t('title')}
        </h2>
      </div>
      <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
        {t('description')}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.slug} className="flex flex-col h-full">
            <ToolCard tool={tool} />
          </div>
        ))}
      </div>
    </div>
  );
}
