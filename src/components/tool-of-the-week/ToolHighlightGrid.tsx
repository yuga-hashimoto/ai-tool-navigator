/**
 * ToolHighlightGrid Component
 * 
 * A grid component for displaying multiple highlighted tools.
 */

"use client";

import { ToolMetadata } from '@/lib/tools';
import { ToolHighlightCard } from './ToolHighlightCard';

interface ToolHighlightGridProps {
  tools: ToolMetadata[];
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'featured';
  showBadges?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ToolHighlightGrid({
  tools,
  title = 'Featured Tools',
  description,
  columns = 3,
  variant = 'default',
  showBadges = true,
  emptyMessage = 'No tools to display',
  className = '',
}: ToolHighlightGridProps) {
  if (tools.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <section className={className}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className={`grid ${gridCols[columns]} gap-4`}>
        {tools.map((tool) => (
          <ToolHighlightCard
            key={tool.slug}
            tool={tool}
            variant={variant}
            showBadge={showBadges && tool.featured}
            badgeText="Featured"
          />
        ))}
      </div>
    </section>
  );
}
