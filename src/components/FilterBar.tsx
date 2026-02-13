"use client";

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  categories: string[];
  years: number[];
  platforms: string[];
  selectedCategories: string[];
  selectedRating: number | null;
  selectedPriceRange: 'all' | 'free' | 'paid' | 'freemium';
  selectedYears: number[];
  selectedPlatforms: string[];
  onCategoryChange: (category: string) => void;
  onRatingChange: (rating: number | null) => void;
  onPriceRangeChange: (priceRange: 'all' | 'free' | 'paid' | 'freemium') => void;
  onYearChange: (year: number) => void;
  onPlatformChange: (platform: string) => void;
}

const RATING_OPTIONS = [4, 3, 2, 1];
const PRICE_OPTIONS = [
  { value: 'all' as const, label: 'All Prices' },
  { value: 'free' as const, label: 'Free' },
  { value: 'freemium' as const, label: 'Freemium' },
  { value: 'paid' as const, label: 'Paid' },
];

export function FilterBar({
  categories,
  years,
  platforms,
  selectedCategories,
  selectedRating,
  selectedPriceRange,
  selectedYears,
  selectedPlatforms,
  onCategoryChange,
  onRatingChange,
  onPriceRangeChange,
  onYearChange,
  onPlatformChange,
}: FilterBarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    rating: true,
    price: false,
    year: false,
    platform: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasAnyFilters =
    selectedCategories.length > 0 ||
    selectedRating !== null ||
    selectedPriceRange !== 'all' ||
    selectedYears.length > 0 ||
    selectedPlatforms.length > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
      {/* Mobile: Collapsible filter panel */}
      <div className="lg:hidden">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="flex items-center gap-2 font-medium">
              <Filter className="h-4 w-4" />
              Filters
              {hasAnyFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length +
                    (selectedRating !== null ? 1 : 0) +
                    (selectedPriceRange !== 'all' ? 1 : 0) +
                    selectedYears.length +
                    selectedPlatforms.length}
                </span>
              )}
            </span>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </summary>
          <div className="mt-4 space-y-4">
            <FilterSection
              title="Category"
              isOpen={expandedSections.categories}
              onToggle={() => toggleSection('categories')}
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      selectedCategories.includes(category)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Rating"
              isOpen={expandedSections.rating}
              onToggle={() => toggleSection('rating')}
            >
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      onRatingChange(selectedRating === rating ? null : rating)
                    }
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1',
                      selectedRating === rating
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                    )}
                  >
                    <span className="text-yellow-500">★</span>
                    {rating}+
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Price"
              isOpen={expandedSections.price}
              onToggle={() => toggleSection('price')}
            >
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onPriceRangeChange(option.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      selectedPriceRange === option.value
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Year"
              isOpen={expandedSections.year}
              onToggle={() => toggleSection('year')}
            >
              <div className="flex flex-wrap gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => onYearChange(year)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      selectedYears.includes(year)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Platform"
              isOpen={expandedSections.platform}
              onToggle={() => toggleSection('platform')}
            >
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => onPlatformChange(platform)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      selectedPlatforms.includes(platform)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                    )}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>
        </details>
      </div>

      {/* Desktop: Always visible filters */}
      <div className="hidden lg:block space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mr-2">
            Filters:
          </span>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full border transition-colors',
                  selectedCategories.includes(category)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                )}
              >
                {category}
              </button>
            ))}
            {categories.length > 8 && (
              <button className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
                +{categories.length - 8} more
              </button>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Rating:</span>
            {RATING_OPTIONS.map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  onRatingChange(selectedRating === rating ? null : rating)
                }
                className={cn(
                  'px-2 py-1 text-sm rounded-full border transition-colors flex items-center gap-0.5',
                  selectedRating === rating
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                )}
              >
                <span className="text-yellow-500">★</span>
                {rating}+
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Price:</span>
            {PRICE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onPriceRangeChange(option.value)}
                className={cn(
                  'px-2 py-1 text-sm rounded-full border transition-colors',
                  selectedPriceRange === option.value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Years */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Year:</span>
            {years.slice(0, 4).map((year) => (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className={cn(
                  'px-2 py-1 text-sm rounded-full border transition-colors',
                  selectedYears.includes(year)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                )}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Platforms */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Platform:</span>
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => onPlatformChange(platform)}
                className={cn(
                  'px-2 py-1 text-sm rounded-full border transition-colors',
                  selectedPlatforms.includes(platform)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500'
                )}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-left font-medium"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}
