"use client";

import { X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterState } from './ToolsPageContent';

interface ActiveFiltersProps {
  filters: FilterState;
  onClearAll: () => void;
  onRemoveCategory: (category: string) => void;
  onRemoveRating: () => void;
  onRemovePriceRange: () => void;
  onRemoveYear: (year: number) => void;
  onRemovePlatform: (platform: string) => void;
  onRemoveSearch: () => void;
}

export function ActiveFilters({
  filters,
  onClearAll,
  onRemoveCategory,
  onRemoveRating,
  onRemovePriceRange,
  onRemoveYear,
  onRemovePlatform,
  onRemoveSearch,
}: ActiveFiltersProps) {
  const activeFiltersCount =
    filters.categories.length +
    (filters.rating !== null ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    filters.years.length +
    filters.platforms.length +
    (filters.search ? 1 : 0);

  if (activeFiltersCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">Active filters:</span>

      {/* Search */}
      {filters.search && (
        <FilterTag
          label={`Search: "${filters.search}"`}
          onRemove={onRemoveSearch}
        />
      )}

      {/* Categories */}
      {filters.categories.map((category) => (
        <FilterTag
          key={category}
          label={category}
          onRemove={() => onRemoveCategory(category)}
        />
      ))}

      {/* Rating */}
      {filters.rating !== null && (
        <FilterTag
          label={<span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{filters.rating}+ stars</span>}
          onRemove={onRemoveRating}
        />
      )}

      {/* Price Range */}
      {filters.priceRange !== 'all' && (
        <FilterTag
          label={`Price: ${filters.priceRange.charAt(0).toUpperCase() + filters.priceRange.slice(1)}`}
          onRemove={onRemovePriceRange}
        />
      )}

      {/* Years */}
      {filters.years.map((year) => (
        <FilterTag
          key={year}
          label={`Year: ${year}`}
          onRemove={() => onRemoveYear(year)}
        />
      ))}

      {/* Platforms */}
      {filters.platforms.map((platform) => (
        <FilterTag
          key={platform}
          label={platform}
          onRemove={() => onRemovePlatform(platform)}
        />
      ))}

      {/* Clear All */}
      <button
        onClick={onClearAll}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-2"
      >
        Clear all ({activeFiltersCount})
      </button>
    </div>
  );
}

interface FilterTagProps {
  label: React.ReactNode;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full',
        'bg-blue-100 dark:bg-blue-900/30',
        'text-blue-700 dark:text-blue-300',
        'transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50'
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
