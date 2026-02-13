"use client";

import { useState, useMemo, useCallback } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { SortDropdown } from '@/components/SortDropdown';
import { ActiveFilters } from '@/components/ActiveFilters';
import { DynamicAdUnit } from '@/components/DynamicAdUnit';
import { useTranslations } from 'next-intl';
import { sendGAEvent } from '@/lib/analytics';

export interface FilterState {
  categories: string[];
  rating: number | null;
  priceRange: 'all' | 'free' | 'paid' | 'freemium';
  years: number[];
  platforms: string[];
  search: string;
}

export type SortOption = 'rating' | 'recent' | 'name' | 'popularity';

interface ToolsPageContentProps {
  tools: ToolMetadata[];
}

export function ToolsPageContent({ tools }: ToolsPageContentProps) {
  const t = useTranslations('ToolsPage');
  const tToolGrid = useTranslations('ToolGrid');

  // Get unique values from tools for filters
  const categories = useMemo(() => {
    return [...new Set(tools.map((tool) => tool.category))].sort();
  }, [tools]);

  const allYears = useMemo(() => {
    return [...new Set(tools.map((tool) => {
      if (tool.last_updated) {
        return new Date(tool.last_updated).getFullYear();
      }
      return new Date().getFullYear();
    }))].sort((a, b) => b - a);
  }, [tools]);

  // Platform extraction - derive from category and metadata if available
  const platforms = ['Web', 'Mobile', 'Desktop'];

  // Initial filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    rating: null,
    priceRange: 'all',
    years: [],
    platforms: [],
    search: '',
  });

  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Filter and sort tools
  const filteredAndSortedTools = useMemo(() => {
    let result = [...tools];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((tool) =>
        tool.title?.toLowerCase().includes(searchLower) ||
        tool.description?.toLowerCase().includes(searchLower) ||
        tool.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((tool) => filters.categories.includes(tool.category));
    }

    // Apply rating filter
    if (filters.rating !== null) {
      result = result.filter((tool) => (tool.rating || 0) >= filters.rating!);
    }

    // Apply price filter
    if (filters.priceRange !== 'all') {
      result = result.filter((tool) => {
        if (filters.priceRange === 'free') {
          return !tool.pricing || tool.pricing === 'free';
        }
        if (filters.priceRange === 'freemium') {
          return tool.pricing === 'freemium';
        }
        if (filters.priceRange === 'paid') {
          return tool.pricing === 'paid' || !tool.pricing;
        }
        return true;
      });
    }

    // Apply year filter
    if (filters.years.length > 0) {
      result = result.filter((tool) => {
        if (tool.last_updated) {
          const year = new Date(tool.last_updated).getFullYear();
          return filters.years.includes(year);
        }
        return false;
      });
    }

    // Apply platform filter (derived from category/type)
    if (filters.platforms.length > 0) {
      result = result.filter((tool) => {
        // Simple platform detection based on category
        const category = tool.category?.toLowerCase();
        return filters.platforms.some((platform) => {
          if (platform === 'Web') {
            return !category?.includes('mobile') && !category?.includes('desktop');
          }
          if (platform === 'Mobile') {
            return category?.includes('mobile') || category?.includes('ios') || category?.includes('android');
          }
          if (platform === 'Desktop') {
            return category?.includes('desktop') || category?.includes('mac') || category?.includes('windows');
          }
          return false;
        });
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'recent':
        result.sort((a, b) => {
          const dateA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
          const dateB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'name':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'popularity':
      default:
        // Sort by featured/sponsored first, then by rating
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.sponsored && !b.sponsored) return -1;
          if (!a.sponsored && b.sponsored) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }

    return result;
  }, [tools, filters, sortBy]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    
    // Track filter usage
    sendGAEvent('filter_change', {
      filter_type: key,
      filter_value: String(value)
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      categories: [],
      rating: null,
      priceRange: 'all',
      years: [],
      platforms: [],
      search: '',
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    handleFilterChange('search', value);
  }, [handleFilterChange]);

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const toggleYear = useCallback((year: number) => {
    setFilters((prev) => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year],
    }));
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setFilters((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.rating !== null ||
      filters.priceRange !== 'all' ||
      filters.years.length > 0 ||
      filters.platforms.length > 0 ||
      filters.search !== ''
    );
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar
        value={filters.search}
        onChange={handleSearchChange}
        placeholder={tToolGrid('searchPlaceholder')}
      />

      {/* Filter and Sort Bar */}
      <FilterBar
        categories={categories}
        years={allYears}
        platforms={platforms}
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

      {/* Active Filters */}
      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onClearAll={handleClearFilters}
          onRemoveCategory={(category) => {
            setFilters((prev) => ({
              ...prev,
              categories: prev.categories.filter((c) => c !== category),
            }));
          }}
          onRemoveRating={() => handleFilterChange('rating', null)}
          onRemovePriceRange={() => handleFilterChange('priceRange', 'all')}
          onRemoveYear={(year) => {
            setFilters((prev) => ({
              ...prev,
              years: prev.years.filter((y) => y !== year),
            }));
          }}
          onRemovePlatform={(platform) => {
            setFilters((prev) => ({
              ...prev,
              platforms: prev.platforms.filter((p) => p !== platform),
            }));
          }}
          onRemoveSearch={() => handleFilterChange('search', '')}
        />
      )}

      {/* Sort Dropdown */}
      <div className="flex justify-end">
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* Results count */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('resultsCount', { count: filteredAndSortedTools.length })}
      </p>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTools.flatMap((tool, index) => {
          const elements = [
            <div key={tool.slug} className="flex flex-col h-full">
              <ToolCard tool={tool} priority={index < 4} />
            </div>,
          ];

          // Insert ad slot periodically
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

      {filteredAndSortedTools.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">{t('noTools')}</p>
        </div>
      )}
    </div>
  );
}
