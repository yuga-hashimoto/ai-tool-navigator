"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { SortDropdown } from '@/components/SortDropdown';
import { ActiveFilters } from '@/components/ActiveFilters';
import { DynamicAdUnit } from '@/components/DynamicAdUnit';
import { useTranslations } from 'next-intl';
import { sendGAEvent } from '@/lib/analytics';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface FilterState {
  categories: string[];
  rating: number | null;
  priceRange: 'all' | 'free' | 'paid' | 'freemium';
  years: number[];
  platforms: string[];
  search: string;
}

export type SortOption = 'rating' | 'recent' | 'name' | 'popularity';

interface AdvancedSearchProps {
  initialTools: ToolMetadata[];
  allCategories: string[];
  allYears: number[];
  allPlatforms: string[];
}

export function AdvancedSearch({
  initialTools,
  allCategories,
  allYears,
  allPlatforms
}: AdvancedSearchProps) {
  const t = useTranslations('ToolsPage');
  const tToolGrid = useTranslations('ToolGrid');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.getAll('category'),
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : null,
    priceRange: (searchParams.get('priceRange') as any) || 'all',
    years: searchParams.getAll('year').map(Number),
    platforms: searchParams.getAll('platform'),
    search: searchParams.get('q') || '',
  });

  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'popularity');

  // Tools state
  const [tools, setTools] = useState<ToolMetadata[]>(initialTools);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTools.length);

  // Update URL helper
  const updateUrl = useCallback((newFilters: FilterState, newSort: SortOption) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set('q', newFilters.search);
      newFilters.categories.forEach(c => params.append('category', c));
      if (newFilters.priceRange !== 'all') params.set('priceRange', newFilters.priceRange);
      if (newFilters.rating) params.set('rating', newFilters.rating!.toString());
      newFilters.years.forEach(y => params.append('year', y.toString()));
      newFilters.platforms.forEach(p => params.append('platform', p));
      params.set('sort', newSort);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  // Fetch results
  const fetchResults = useCallback(async (currentFilters: FilterState, currentSort: SortOption) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.set('q', currentFilters.search);
      currentFilters.categories.forEach(c => params.append('category', c));

      if (currentFilters.priceRange === 'free') params.append('pricing', 'free');
      if (currentFilters.priceRange === 'freemium') params.append('pricing', 'freemium');
      if (currentFilters.priceRange === 'paid') params.append('pricing', 'paid');

      if (currentFilters.rating) params.set('rating', currentFilters.rating.toString());
      currentFilters.platforms.forEach(p => params.append('platform', p));
      currentFilters.years.forEach(y => params.append('year', y.toString()));

      params.set('sort', currentSort);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setTools(data.hits);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
    setFilters((prev) => {
        const next = { ...prev, [key]: value };
        updateUrl(next, sortBy);
        return next;
    });

    sendGAEvent('filter_change', {
      filter_type: key,
      filter_value: String(value)
    });
  }, [sortBy, updateUrl]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: SortOption) => {
      setSortBy(newSort);
      updateUrl(filters, newSort);
  }, [filters, updateUrl]);

  // Debounced fetch on filter/sort change
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
        isFirstRun.current = false;
        // If URL has params different from default, fetch?
        if (searchParams.toString()) {
             fetchResults(filters, sortBy);
        }
        return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(filters, sortBy);
    }, 300);

    return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  }, [filters, sortBy, fetchResults]);

  // Derived handlers
  const handleClearFilters = useCallback(() => {
    setFilters({
      categories: [],
      rating: null,
      priceRange: 'all',
      years: [],
      platforms: [],
      search: '',
    });
    updateUrl({
      categories: [],
      rating: null,
      priceRange: 'all',
      years: [],
      platforms: [],
      search: '',
    }, sortBy);
  }, [sortBy, updateUrl]);

  const handleSearchChange = useCallback((value: string) => {
    handleFilterChange('search', value);
  }, [handleFilterChange]);

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => {
        const nextCats = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
        const next = { ...prev, categories: nextCats };
        updateUrl(next, sortBy);
        return next;
    });
  }, [sortBy, updateUrl]);

  const toggleYear = useCallback((year: number) => {
     setFilters((prev) => {
        const nextYears = prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year];
        const next = { ...prev, years: nextYears };
        updateUrl(next, sortBy);
        return next;
    });
  }, [sortBy, updateUrl]);

  const togglePlatform = useCallback((platform: string) => {
    setFilters((prev) => {
        const nextPlatforms = prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform];
        const next = { ...prev, platforms: nextPlatforms };
        updateUrl(next, sortBy);
        return next;
    });
  }, [sortBy, updateUrl]);


  const hasActiveFilters =
      filters.categories.length > 0 ||
      filters.rating !== null ||
      filters.priceRange !== 'all' ||
      filters.years.length > 0 ||
      filters.platforms.length > 0 ||
      filters.search !== '';

  return (
    <div className="space-y-6">
      <SearchBar
        value={filters.search}
        onChange={handleSearchChange}
        placeholder={tToolGrid('searchPlaceholder')}
      />

      <FilterBar
        categories={allCategories}
        years={allYears}
        platforms={allPlatforms}
        selectedCategories={filters.categories}
        selectedRating={filters.rating}
        selectedPriceRange={filters.priceRange}
        selectedYears={filters.years}
        selectedPlatforms={filters.platforms}
        onCategoryChange={toggleCategory}
        onRatingChange={(rating) => handleFilterChange('rating', rating)}
        onPriceRangeChange={(priceRange) => handleFilterChange('priceRange', priceRange)}
        onYearChange={toggleYear}
        onPlatformChange={togglePlatform}
      />

      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onClearAll={handleClearFilters}
          onRemoveCategory={(category) => toggleCategory(category)}
          onRemoveRating={() => handleFilterChange('rating', null)}
          onRemovePriceRange={() => handleFilterChange('priceRange', 'all')}
          onRemoveYear={(year) => toggleYear(year)}
          onRemovePlatform={(platform) => togglePlatform(platform)}
          onRemoveSearch={() => handleFilterChange('search', '')}
        />
      )}

      <div className="flex justify-between items-center">
         <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('resultsCount', { count: total })}
         </p>
         <SortDropdown value={sortBy} onChange={handleSortChange} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-100 transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
        {tools.flatMap((tool, index) => {
          const elements = [
            <div key={tool.slug} className="flex flex-col h-full">
              <ToolCard tool={tool} priority={index < 4} />
            </div>,
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

      {!loading && tools.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">{t('noTools')}</p>
        </div>
      )}
    </div>
  );
}
