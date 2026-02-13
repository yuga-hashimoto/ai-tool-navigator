"use client";

import { useState, useCallback } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { QuickViewModal } from '@/components/quick-view/QuickViewModal';
import { useQuickView } from '@/hooks/useQuickView';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useAvailability } from '@/hooks/useAvailability';
import { useMiniCart } from '@/hooks/useMiniCart';
import { ToolCard } from '@/components/ToolCard';

interface QuickViewToolGridProps {
  tools: ToolMetadata[];
  hideSearch?: boolean;
  priority?: boolean;
}

export function QuickViewToolGrid({ tools, hideSearch, priority = false }: QuickViewToolGridProps) {
  const { selectedTool, openQuickView, closeQuickView, isQuickViewOpen } = useQuickView();
  const { addToCart, isAdding, addedItems } = useQuickAdd();
  const { checkAvailability, availabilityCache } = useAvailability();
  const { addToMiniCart, miniCartOpen, openMiniCart, closeMiniCart, miniCartItems } = useMiniCart();

  const handleQuickView = useCallback((tool: ToolMetadata) => {
    openQuickView(tool);
    // Check availability when opening quick view
    checkAvailability(tool.slug);
  }, [openQuickView, checkAvailability]);

  const handleQuickAdd = useCallback(async (tool: ToolMetadata) => {
    const success = await addToCart(tool);
    if (success) {
      // Add to mini cart as well
      addToMiniCart(tool);
      // Open mini cart to show confirmation
      openMiniCart();
    }
  }, [addToCart, addToMiniCart, openMiniCart]);

  return (
    <>
      <div className="tool-grid" data-testid="quick-view-tool-grid">
        {tools.map((tool, index) => (
          <div key={tool.slug} className="quick-view-wrapper">
            <ToolCard
              tool={tool}
              priority={priority && index < 4}
            />
            
            {/* Quick Action Buttons Overlay */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickView(tool);
                }}
                className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700"
                aria-label={`Quick view ${tool.title}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickAdd(tool);
                }}
                disabled={addedItems.has(tool.slug)}
                className={`p-2 rounded-full shadow-md transition-colors ${
                  addedItems.has(tool.slug)
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
                aria-label={`${addedItems.has(tool.slug) ? 'Added to cart' : 'Quick add'} ${tool.title}`}
              >
                {addedItems.has(tool.slug) ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </button>
            </div>

            {/* Availability Badge */}
            {availabilityCache[tool.slug] !== undefined && (
              <div className={`absolute bottom-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-medium ${
                availabilityCache[tool.slug]
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {availabilityCache[tool.slug] ? 'In Stock' : 'Out of Stock'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        tool={selectedTool}
      />
    </>
  );
}
