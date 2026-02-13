"use client";

import { useState, useCallback } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { sendGAEvent } from '@/lib/analytics';

interface UseQuickAddReturn {
  addToCart: (tool: ToolMetadata) => Promise<boolean>;
  isAdding: boolean;
  addedItems: Set<string>;
  clearAddedItems: () => void;
}

export function useQuickAdd(): UseQuickAddReturn {
  const [isAdding, setIsAdding] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const addToCart = useCallback(async (tool: ToolMetadata): Promise<boolean> => {
    if (addedItems.has(tool.slug)) {
      // Already added, return success
      return true;
    }

    setIsAdding(true);

    try {
      // Simulate API call delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // In production, this would call the cart API
      // const response = await fetch('/api/cart/add', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ toolSlug: tool.slug, quantity: 1 }),
      // });

      // Track the add to cart event
      sendGAEvent('add_to_cart', {
        tool_slug: tool.slug,
        tool_name: tool.title,
        category: tool.category,
        price: tool.price || '0',
        currency: 'USD',
      });

      // Mark as added
      setAddedItems(prev => new Set(prev).add(tool.slug));

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setAddedItems(prev => {
          const next = new Set(prev);
          next.delete(tool.slug);
          return next;
        });
      }, 3000);

      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [addedItems]);

  const clearAddedItems = useCallback(() => {
    setAddedItems(new Set());
  }, []);

  return {
    addToCart,
    isAdding,
    addedItems,
    clearAddedItems,
  };
}
