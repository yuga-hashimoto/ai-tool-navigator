'use client';

import { useEffect, useState } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { useTranslations } from 'next-intl';

interface CartRecommendationsProps {
  slugs: string[];
  limit?: number;
}

export function CartRecommendations({ slugs, limit = 3 }: CartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ToolMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('CartRecommendations');

  useEffect(() => {
    async function fetchRecommendations() {
      if (slugs.length === 0) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/recommendations?cart=${slugs.join(',')}&limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [slugs, limit]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{t('title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(limit)].map((_, i) => (
             <div key={i} className="animate-pulse h-80 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
           ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xl font-bold mb-4">{t('title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
