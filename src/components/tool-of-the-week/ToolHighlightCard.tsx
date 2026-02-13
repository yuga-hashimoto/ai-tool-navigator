/**
 * ToolHighlightCard Component
 * 
 * A reusable component for displaying highlighted tools in various contexts.
 */

"use client";

import { ToolMetadata } from '@/lib/tools';
import { Link } from '@/i18n/routing';
import { Star, ExternalLink, Zap } from 'lucide-react';
import { Rating } from '@/components/Rating';
import Image from 'next/image';

interface ToolHighlightCardProps {
  tool: ToolMetadata;
  variant?: 'default' | 'compact' | 'featured';
  showBadge?: boolean;
  badgeText?: string;
  showRating?: boolean;
  lazyLoad?: boolean;
  className?: string;
}

export function ToolHighlightCard({
  tool,
  variant = 'default',
  showBadge = false,
  badgeText = 'Featured',
  showRating = true,
  lazyLoad = true,
  className = '',
}: ToolHighlightCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}>
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {tool.image ? (
            <Image
              src={tool.image}
              alt={tool.title}
              fill
              loading={lazyLoad ? 'lazy' : 'eager'}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {tool.title.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
            <Link href={`/tools/${tool.slug}`} className="hover:underline">
              {tool.title}
            </Link>
          </h4>
          {showRating && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {tool.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <Link
          href={`/tools/${tool.slug}`}
          className="flex-shrink-0 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 
        bg-white dark:bg-zinc-900 transition-all hover:shadow-lg
        ${isFeatured ? 'ring-2 ring-purple-500' : ''}
        ${className}
      `}
    >
      {showBadge && tool.featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Zap className="h-3 w-3" />
            {badgeText}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            {tool.image ? (
              <Image
                src={tool.image}
                alt={tool.title}
                fill
                loading={lazyLoad ? 'lazy' : 'eager'}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                {tool.title.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 mb-2">
              {tool.category}
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              <Link href={`/tools/${tool.slug}`} className="hover:underline decoration-purple-500/30">
                {tool.title}
              </Link>
            </h3>
            
            {showRating && (
              <div className="flex items-center gap-2 mb-2">
                <Rating 
                  rating={tool.rating} 
                  size="h-4 w-4" 
                  textClassName="text-sm font-semibold" 
                />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ({tool.rating.toFixed(1)}/5)
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {tool.description}
        </p>

        {tool.pros && tool.pros.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Key Benefits:
            </p>
            <ul className="space-y-1">
              {tool.pros.slice(0, 2).map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="line-clamp-1">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href={`/tools/${tool.slug}`}
            className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {isFeatured ? 'Try It Now' : 'Learn More'}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
