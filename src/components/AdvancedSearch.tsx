"use client";

import { useSearch } from '@/hooks/useSearch';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { ActiveFilters } from '@/components/ActiveFilters';
import { ToolCard } from '@/components/ToolCard';
import { DynamicAdUnit } from '@/components/DynamicAdUnit';
import { useTranslations } from 'next-intl';
import { ToolMetadata } from '@/lib/tools';
import { useMemo } from 'react';

interface AdvancedSearchProps {
  initialTools?: ToolMetadata[];
  locale: string;
}

export function AdvancedSearch({ initialTools, locale }: AdvancedSearchProps) {
  const t = useTranslations('ToolsPage');
  const tToolGrid = useTranslations('ToolGrid');

  const {
    state,
    results,
    total,
    aggregations,
    loading,
    error,
    setQuery,
    setCategory,
    setRating,
    setPrice,
    clearFilters,
  } = useSearch({}, locale);

  const categories = useMemo(() => {
    if (aggregations?.categories?.buckets) {
      return aggregations.categories.buckets.map((b: any) => b.key).sort();
    }
    return [];
  }, [aggregations]);

  const handleCategoryChange = (category: string) => {
    const newCategories = state.category.includes(category)
      ? state.category.filter(c => c !== category)
      : [...state.category, category];
    setCategory(newCategories);
  };

  const handleRatingChange = (rating: number | null) => {
    setRating(rating);
  };

  const handlePriceChange = (price: 'all' | 'free' | 'paid' | 'freemium') => {
    setPrice(price);
  };

  const hasActiveFilters = state.category.length > 0 || state.rating !== null || state.price !== 'all' || state.q !== '';

  if (error === 'Elasticsearch is not configured') {
      return <div className="text-center p-4">Elasticsearch is not configured.</div>;
  }

  return (
    <div className="space-y-6">
      <SearchBar
        value={state.q}
        onChange={setQuery}
        placeholder={tToolGrid('searchPlaceholder')}
      />

      <FilterBar
        categories={categories}
        years={[]}
        platforms={[]}
        selectedCategories={state.category}
        selectedRating={state.rating}
        selectedPriceRange={state.price}
        selectedYears={[]}
        selectedPlatforms={[]}
        onCategoryChange={handleCategoryChange}
        onRatingChange={handleRatingChange}
        onPriceRangeChange={handlePriceChange}
        onYearChange={() => {}}
        onPlatformChange={() => {}}
      />

      {hasActiveFilters && (
        <ActiveFilters
          filters={{
              categories: state.category,
              rating: state.rating,
              priceRange: state.price,
              years: [],
              platforms: [],
              search: state.q
          }}
          onClearAll={clearFilters}
          onRemoveCategory={(c) => handleCategoryChange(c)}
          onRemoveRating={() => setRating(null)}
          onRemovePriceRange={() => setPrice('all')}
          onRemoveYear={() => {}}
          onRemovePlatform={() => {}}
          onRemoveSearch={() => setQuery('')}
        />
      )}

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('resultsCount', { count: total })}
      </p>

      {loading && results.length === 0 ? (
        <div className="py-12 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool, index) => {
                const elements = [
                    <div key={tool.slug || index} className="flex flex-col h-full">
                        <ToolCard tool={tool} priority={index < 4} />
                    </div>
                ];
                 if ((index + 1) % 3 === 0) {
                    elements.push(
                      <DynamicAdUnit
                        key={`ad-${index}`}
                        index={index}
                        type="grid"
                        className="flex flex-col h-full min-h-[300px]"
                        slot="grid"
                      />
                    );
                  }
                return elements;
            })}
        </div>
      )}

       {results.length === 0 && !loading && (
        <div className="py-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">{t('noTools')}</p>
        </div>
      )}
    </div>
  );
}
