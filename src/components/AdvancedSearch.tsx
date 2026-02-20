"use client";

import { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchBar } from '@/components/SearchBar';
import { ToolCard } from '@/components/ToolCard';
import { FilterBar } from '@/components/FilterBar';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { ToolMetadata } from '@/lib/tools';

export function AdvancedSearch() {
  const t = useTranslations('ToolsPage');
  const tToolGrid = useTranslations('ToolGrid');

  const { options, updateOption, updateFilter, results, loading, error, refresh } = useSearch({
    limit: 12,
    page: 1,
    sort: 'relevance',
    filters: {
        category: [],
        price: 'all',
        platform: [],
        rating: null
    }
  });

  // Load initial results
  useEffect(() => {
    refresh();
  }, []);

  const categories = results?.facets?.categories.map(c => c.key) || [];
  const platforms = results?.facets?.platforms.map(p => p.key) || [];
  const years: number[] = []; // Not supported yet

  return (
    <div className="space-y-6">
      <SearchBar
        value={options.q || ''}
        onChange={(val) => updateOption('q', val)}
        placeholder={tToolGrid('searchPlaceholder')}
      />

      <FilterBar
        categories={categories}
        years={years}
        platforms={platforms}
        selectedCategories={options.filters?.category || []}
        selectedRating={options.filters?.rating || null}
        selectedPriceRange={(options.filters?.price as any) || 'all'}
        selectedYears={[]}
        selectedPlatforms={options.filters?.platform || []}
        onCategoryChange={(cat) => {
            const current = options.filters?.category || [];
            const newCats = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
            updateFilter('category', newCats);
        }}
        onRatingChange={(rating) => updateFilter('rating', rating)}
        onPriceRangeChange={(price) => updateFilter('price', price)}
        onYearChange={(year) => console.log('Year filter not supported')}
        onPlatformChange={(plat) => {
            const current = options.filters?.platform || [];
            const newPlats = current.includes(plat) ? current.filter(p => p !== plat) : [...current, plat];
            updateFilter('platform', newPlats);
        }}
      />

      {loading && (
        <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">
            Search unavailable: {error}
        </div>
      )}

      {!loading && results && (
        <>
            <div className="flex justify-between items-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t('resultsCount', { count: results.total })}
                </p>
                <select
                    value={options.sort}
                    onChange={(e) => updateOption('sort', e.target.value)}
                    className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500"
                >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="date">Newest</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.hits.map((tool: ToolMetadata) => (
                    <div key={tool.slug} className="flex flex-col h-full">
                        <ToolCard tool={tool} />
                    </div>
                ))}
            </div>

            {results.hits.length === 0 && (
                <div className="py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">{t('noTools')}</p>
                </div>
            )}
        </>
      )}
    </div>
  );
}
