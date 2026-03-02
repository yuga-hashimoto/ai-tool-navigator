"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { useCompare } from '@/context/CompareContext';
import { useAvailability } from '@/hooks/useAvailability';
import { sendGAEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { X, Check, Star, ArrowRight, ArrowLeft, Loader2, Zap } from 'lucide-react';

interface CompareViewProps {
  tools: ToolMetadata[];
}

type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'rating' | 'price' | 'name';

export function CompareView({ tools }: CompareViewProps) {
  const { selectedSlugs, removeTool, clearSelection } = useCompare();
  const { checkMultipleAvailability, availabilityCache } = useAvailability();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

  // Filter and sort tools based on selection
  const selectedTools = useMemo(() => {
    let filtered = tools.filter((tool) => selectedSlugs.includes(tool.slug));
    
    // Sort tools
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => {
          const priceA = parsePrice(a.price);
          const priceB = parsePrice(b.price);
          return priceA - priceB;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return filtered;
  }, [tools, selectedSlugs, sortBy]);

  // Load availability for selected tools
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);
      await checkMultipleAvailability(selectedSlugs);
      setIsLoading(false);
    };
    
    if (selectedSlugs.length > 0) {
      loadAvailability();
    }
  }, [selectedSlugs, checkMultipleAvailability]);

  // Track compare view
  useEffect(() => {
    if (selectedTools.length > 0) {
      sendGAEvent('compare_view', {
        tool_count: selectedTools.length,
        tool_slugs: selectedTools.map(t => t.slug).join(','),
      });
    }
  }, [selectedTools]);

  const handleRemoveTool = useCallback((slug: string, name: string) => {
    removeTool(slug);
    sendGAEvent('compare_remove_tool', {
      tool_slug: slug,
      tool_name: name,
    });
  }, [removeTool]);

  const handleClearAll = useCallback(() => {
    clearSelection();
    sendGAEvent('compare_clear_all', {
      tool_count: selectedSlugs.length,
    });
  }, [clearSelection, selectedSlugs.length]);

  if (selectedSlugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 mb-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Zap className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          No tools selected for comparison
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-md">
          Select up to 4 tools to compare their features, pricing, and ratings side by side.
        </p>
      </div>
    );
  }

  // Feature comparison keys
  const features = [
    { key: 'rating', label: 'Rating', getValue: (t: ToolMetadata) => `${t.rating}/5.0` },
    { key: 'pricing', label: 'Pricing', getValue: (t: ToolMetadata) => t.pricing ? t.pricing.charAt(0).toUpperCase() + t.pricing.slice(1) : '-' },
    { key: 'price', label: 'Price', getValue: (t: ToolMetadata) => t.price || 'Free' },
    { key: 'platform', label: 'Platform', getValue: (t: ToolMetadata) => t.platform?.join(', ') || '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {selectedTools.length} of 4 selected
          </span>
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-900"
          >
            <option value="rating">Highest Rated</option>
            <option value="price">Lowest Price</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'compact' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              aria-label="Compact view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-zinc-500">Loading comparison data...</span>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedTools.map((tool) => (
            <div
              key={tool.slug}
              className={cn(
                "relative p-4 bg-white dark:bg-zinc-900 rounded-xl border transition-all",
                highlightedSlug === tool.slug
                  ? "border-blue-500 shadow-lg"
                  : "border-zinc-200 dark:border-zinc-800 hover:shadow-md"
              )}
              onMouseEnter={() => setHighlightedSlug(tool.slug)}
              onMouseLeave={() => setHighlightedSlug(null)}
            >
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveTool(tool.slug, tool.title)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-colors z-10"
                aria-label={`Remove ${tool.title} from comparison`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                {tool.image && (
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-20 h-20 mx-auto rounded-xl object-cover mb-3"
                  />
                )}
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {tool.title}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400 mt-1">
                  {tool.category}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{tool.rating}</span>
                <span className="text-zinc-400">/5.0</span>
              </div>

              {/* Availability */}
              <div className="flex justify-center mb-3">
                {availabilityCache[tool.slug] !== undefined ? (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    availabilityCache[tool.slug]
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {availabilityCache[tool.slug] ? 'Available' : 'Unavailable'}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500">
                    Checking...
                  </span>
                )}
              </div>

              {/* Quick Specs */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pricing</span>
                  <span className="font-medium capitalize">{tool.pricing || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Price</span>
                  <span className="font-medium">{tool.price || 'Free'}</span>
                </div>
              </div>

              {/* Action */}
              <a
                href={tool.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                onClick={() => sendGAEvent('affiliate_click', {
                  tool_slug: tool.slug,
                  tool_name: tool.title,
                  position: 'compare_grid',
                })}
              >
                Visit Site
              </a>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left py-3 px-4 font-medium text-zinc-500">Feature</th>
                {selectedTools.map((tool) => (
                  <th key={tool.slug} className="text-center py-3 px-4">
                    <div className="flex flex-col items-center">
                      {tool.image && (
                        <img src={tool.image} alt={tool.title} className="w-12 h-12 rounded-lg object-cover mb-2" />
                      )}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tool.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr
                  key={feature.key}
                  className={cn(
                    "border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors",
                    activeFeature === feature.key && "bg-blue-50 dark:bg-blue-900/10"
                  )}
                  onClick={() => setActiveFeature(activeFeature === feature.key ? null : feature.key)}
                >
                  <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                    {feature.label}
                  </td>
                  {selectedTools.map((tool) => (
                    <td key={tool.slug} className="text-center py-3 px-4">
                      {feature.getValue(tool)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">Availability</td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="text-center py-3 px-4">
                    {availabilityCache[tool.slug] !== undefined ? (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        availabilityCache[tool.slug]
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {availabilityCache[tool.slug] ? '✓' : '✗'}
                      </span>
                    ) : (
                      <span className="text-zinc-400">...</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4"></td>
                {selectedTools.map((tool) => (
                  <td key={tool.slug} className="text-center py-3 px-4">
                    <a
                      href={tool.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                      onClick={() => sendGAEvent('affiliate_click', {
                        tool_slug: tool.slug,
                        tool_name: tool.title,
                        position: 'compare_list',
                      })}
                    >
                      Visit Site
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Compact View */}
      {!isLoading && viewMode === 'compact' && (
        <div className="space-y-4">
          {selectedTools.map((tool) => (
            <div
              key={tool.slug}
              className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              {tool.image && (
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {tool.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {tool.rating}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-sm text-zinc-500 capitalize">{tool.pricing || 'Free'}</span>
                  <span className="text-zinc-300">•</span>
                  {availabilityCache[tool.slug] !== undefined ? (
                    <span className={cn(
                      "text-xs font-medium",
                      availabilityCache[tool.slug]
                        ? "text-green-600"
                        : "text-red-600"
                    )}>
                      {availabilityCache[tool.slug] ? 'In Stock' : 'Out of Stock'}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">Checking...</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleRemoveTool(tool.slug, tool.title)}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                aria-label="Remove"
              >
                <X className="w-4 h-4" />
              </button>
              
              <a
                href={tool.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors whitespace-nowrap"
                onClick={() => sendGAEvent('affiliate_click', {
                  tool_slug: tool.slug,
                  tool_name: tool.title,
                  position: 'compare_compact',
                })}
              >
                Visit
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Quick Comparison CTA */}
      {!isLoading && selectedTools.length >= 2 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            Ready to make a decision?
          </h3>
          <p className="text-blue-100 mb-4">
            Compare {selectedTools.length} tools side by side with detailed analysis
          </p>
          <a
            href="/compare"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Full Comparison
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

// Helper function
function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
