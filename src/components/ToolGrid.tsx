"use client";

import { useState, useEffect, useRef } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from './ToolCard';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { DynamicAdUnit } from './DynamicAdUnit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { sendGAEvent } from '@/lib/analytics';

interface ToolGridProps {
  tools: ToolMetadata[];
  hideSearch?: boolean;
  priority?: boolean;
}

export function ToolGrid({ tools, hideSearch, priority = false }: ToolGridProps) {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const query = searchParams.get('search');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(query || '');
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
        if (value.trim()) {
            sendGAEvent('search', { search_term: value });
        }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const t = useTranslations('ToolGrid');
  const tHome = useTranslations('HomePage');
  const tToolsPage = useTranslations('ToolsPage');

  // Derive categories from tools
  const categories = ['All', ...Array.from(new Set(tools.map((tool) => tool.category)))];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (tool.title && tool.title.toLowerCase().includes(searchLower)) ||
      (tool.description && tool.description.toLowerCase().includes(searchLower)) ||
      (tool.category && tool.category.toLowerCase().includes(searchLower)) ||
      (tool.pros && tool.pros.some((p) => p && p.toLowerCase().includes(searchLower))) ||
      (tool.cons && tool.cons.some((c) => c && c.toLowerCase().includes(searchLower)));

    return matchesCategory && matchesSearch;
  });

  return (
    <div id="tool-grid">
        <div className="mb-8 space-y-4">
             {/* Search Bar */}
            {!hideSearch && (
              <div className="relative max-w-md mx-auto sm:mx-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {tToolsPage('resultsCount', { count: filteredTools.length })}
              </p>
              {searchQuery && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  “{searchQuery}”
                </p>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => {
                            setSelectedCategory(category);
                            sendGAEvent('select_content', {
                                content_type: 'category',
                                item_id: category
                            });
                        }}
                        className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                            selectedCategory === category
                                ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                                : "border-transparent bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        )}
                    >
                        {category === 'All' ? t('all') : category}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.flatMap((tool, index) => {
                const elements = [
                    <div key={tool.slug} className="flex flex-col h-full">
                        <ToolCard tool={tool} priority={priority && index < 4} />
                    </div>
                ];

                // Insert ad slot periodically (the component decides visibility based on user preference)
                // We insert potentially every 3 items to allow for high-density configurations
                if ((index + 1) % 3 === 0) {
                    elements.push(
                        <DynamicAdUnit
                            key={`ad-${index}`}
                            index={index}
                            type="grid"
                            className="flex flex-col h-full min-h-[300px]" // Ensure height for alignment
                            slot="grid"
                        />
                    );
                }

                return elements;
            })}
        </div>
        {filteredTools.length === 0 && (
            <div className="py-12 text-center">
                <p className="text-zinc-500 dark:text-zinc-400">{tHome('noTools')}</p>
            </div>
        )}
    </div>
  );
}
