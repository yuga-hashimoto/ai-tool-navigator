"use client";

import { Link } from '@/i18n/routing';
import { ToolMetadata } from '@/lib/tools';
import { cn } from '@/lib/utils';
import { Rating } from '@/components/Rating';
import { useCompare } from '@/context/CompareContext';
import { MouseEvent, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Eye, ShoppingCart, Check, Star, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useAvailability } from '@/hooks/useAvailability';
import { useMiniCart } from '@/hooks/useMiniCart';

export function QuickViewToolCard({ tool, priority }: { tool: ToolMetadata; priority?: boolean }) {
  const { selectedSlugs, toggleTool } = useCompare();
  const isSelected = selectedSlugs.includes(tool.slug);
  const { addToCart, isAdding, addedItems } = useQuickAdd();
  const { availabilityCache, checkAvailability } = useAvailability();
  const { addToMiniCart, openMiniCart } = useMiniCart();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const t = useTranslations('ToolCard');

  const handleCompareClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTool(tool.slug);
  };

  const handleQuickView = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Emit custom event for QuickViewModal to listen to
    window.dispatchEvent(new CustomEvent('openQuickView', { detail: tool }));
  };

  const handleQuickAdd = useCallback(async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = await addToCart(tool);
    if (success) {
      addToMiniCart(tool);
      openMiniCart();
    }
  }, [addToCart, tool, addToMiniCart, openMiniCart]);

  // Check availability on hover
  const handleMouseEnter = useCallback(() => {
    setShowQuickActions(true);
    checkAvailability(tool.slug);
  }, [tool.slug, checkAvailability]);

  return (
    <div 
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg dark:bg-zinc-900/50 dark:hover:bg-zinc-900",
        isSelected
          ? "border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400"
          : tool.sponsored
          ? "border-amber-400 ring-1 ring-amber-400/50 dark:border-amber-500 dark:ring-amber-500/50 bg-amber-50/30 dark:bg-amber-900/10"
          : "border-zinc-200 dark:border-zinc-800"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowQuickActions(false)}
    >
      {tool.image && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={tool.image}
            alt={tool.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      {/* Quick Actions Overlay */}
      <div className={cn(
        "absolute top-2 right-2 z-10 flex flex-col gap-2 transition-opacity duration-200",
        showQuickActions ? "opacity-100" : "opacity-0"
      )}>
        {/* Quick View Button */}
        <button
          onClick={handleQuickView}
          className="p-2.5 bg-white dark:bg-zinc-800 rounded-full shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Quick view"
        >
          <Eye className="w-4 h-4" />
        </button>
        
        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          disabled={addedItems.has(tool.slug)}
          className={cn(
            "p-2.5 rounded-full shadow-md transition-colors",
            addedItems.has(tool.slug)
              ? "bg-green-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-500"
          )}
          aria-label={addedItems.has(tool.slug) ? "Added to cart" : "Quick add to cart"}
        >
          {addedItems.has(tool.slug) ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
        </button>
        
        {/* Compare Button */}
        <button
          onClick={handleCompareClick}
          className={cn(
            "p-2.5 rounded-full shadow-md transition-colors",
            isSelected
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          )}
          aria-label={isSelected ? "Remove from compare" : "Add to compare"}
        >
          {isSelected ? (
            <Check className="w-4 h-4" />
          ) : (
            <Star className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Availability Badge */}
      {availabilityCache[tool.slug] !== undefined && (
        <div className={cn(
          "absolute bottom-2 left-2 z-10 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity duration-200",
          showQuickActions ? "opacity-100" : "opacity-0",
          availabilityCache[tool.slug]
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {availabilityCache[tool.slug] ? t('inStock') : t('outOfStock')}
        </div>
      )}

      <div className="flex flex-col justify-between flex-grow p-6">
        <div>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                  {tool.category}
                  </span>
                  {tool.sponsored && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-500 dark:ring-amber-400/20 uppercase tracking-wide">
                      {t('sponsored')}
                    </span>
                  )}
                  {tool.featured && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-500 dark:ring-amber-400/20">
                      {t('featured')}
                  </span>
                  )}
                  {tool.discount && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-400/10 dark:text-green-500 dark:ring-green-400/20">
                      {tool.discount}
                    </span>
                  )}
              </div>
              <Rating rating={tool.rating} compact={true} />
          </div>
          <div className="mt-4">
              <h3 className="text-lg font-semibold leading-6 text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  <Link href={`/tools/${tool.slug}`}>
                      <span className="absolute inset-0" />
                      {tool.title}
                  </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {tool.description}
              </p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
          {t('readMore')} <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  );
}
