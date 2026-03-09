"use client";

import { useRecentlyViewed, RecentlyViewedTool } from '@/hooks/useRecentlyViewed';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Clock, Trash2, X, ExternalLink } from 'lucide-react';
import { Rating } from '@/components/Rating';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RecentToolsSidebarProps {
  className?: string;
  maxItems?: number;
  showCategory?: boolean;
  compact?: boolean;
}

export function RecentToolsSidebar({
  className,
  maxItems = 5,
  showCategory = true,
  compact = false,
}: RecentToolsSidebarProps) {
  const t = useTranslations('RecentToolsSidebar');
  const { recentTools, removeTool, clearAll, isLoading } = useRecentlyViewed();

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recentTools.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-zinc-500" />
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {t('title')}
          </h3>
        </div>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            {t('emptyTitle')}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t('emptyDescription')}
          </p>
        </div>
      </div>
    );
  }

  const displayTools = recentTools.slice(0, maxItems);

  return (
    <div className={cn("rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {t('title')}
          </h3>
          <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
            {recentTools.length}
          </span>
        </div>
        {recentTools.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1"
            aria-label={t('clearAll')}
          >
            <Trash2 className="h-3 w-3" />
            {t('clear')}
          </button>
        )}
      </div>

      {/* Tool List */}
      <div className={cn("divide-y divide-zinc-100 dark:divide-zinc-800", compact ? '' : 'p-2')}>
        {displayTools.map((tool) => (
          <RecentToolItem
            key={tool.slug}
            tool={tool}
            showCategory={showCategory}
            compact={compact}
            onRemove={() => removeTool(tool.slug)}
          />
        ))}
      </div>

      {/* Footer */}
      {recentTools.length > maxItems && (
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/recently-viewed"
            className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {t('viewAll')}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

interface RecentToolItemProps {
  tool: RecentlyViewedTool;
  showCategory: boolean;
  compact: boolean;
  onRemove: () => void;
}

function RecentToolItem({
  tool,
  showCategory,
  compact,
  onRemove,
}: RecentToolItemProps) {
  const t = useTranslations('RecentToolsSidebar');

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('minutesAgo', { count: minutes });
    if (hours < 24) return t('hoursAgo', { count: hours });
    if (days < 7) return t('daysAgo', { count: days });

    return new Date(timestamp).toLocaleDateString();
  };

  if (compact) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
      >
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {tool.image ? (
            <Image
              src={tool.image}
              alt={tool.title}
              fill
              sizes="40px"
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-bold text-zinc-400">
              {tool.title.substring(0, 2)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {tool.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {formatTimeAgo(tool.viewedAt)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
          aria-label={t('remove')}
        >
          <X className="h-4 w-4" />
        </button>
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group">
      <Link href={`/tools/${tool.slug}`} className="flex-shrink-0">
        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {tool.image ? (
            <Image
              src={tool.image}
              alt={tool.title}
              fill
              sizes="48px"
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-zinc-400">
              {tool.title.substring(0, 2)}
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/tools/${tool.slug}`}
          className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {tool.title}
          </h4>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          {showCategory && tool.category && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {tool.category}
            </span>
          )}
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            •
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTimeAgo(tool.viewedAt)}
          </span>
        </div>

        <div className="mt-1">
          <Rating rating={tool.rating} size="h-3 w-3" textClassName="text-xs" />
        </div>
      </div>

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all flex-shrink-0"
        aria-label={t('remove')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Compact version for sidebar integration
 */
export function RecentToolsWidget({ className }: { className?: string }) {
  return (
    <RecentToolsSidebar
      className={className}
      maxItems={4}
      showCategory={false}
      compact={true}
    />
  );
}
