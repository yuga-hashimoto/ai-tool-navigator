"use client";

import { useState, useCallback, useEffect } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { useProductTracking } from '@/hooks/useProductTracking';

interface CartItem {
  id: string;
  tool: ToolMetadata;
  quantity: number;
  addedAt: number;
}

interface UseMiniCartReturn {
  miniCartItems: CartItem[];
  miniCartOpen: boolean;
  itemCount: number;
  subtotal: number;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
  addToMiniCart: (tool: ToolMetadata) => void;
  removeFromMiniCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearMiniCart: () => void;
  proceedToCheckout: () => void;
}

const CART_STORAGE_KEY = 'mini_cart_items';
const MAX_CART_ITEMS = 10;
const CART_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useMiniCart(): UseMiniCartReturn {
  const [miniCartItems, setMiniCartItems] = useState<CartItem[]>([]);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const { trackEvent } = useProductTracking();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const now = Date.now();
        
        // Filter out expired items
        const validItems = items.filter(
          item => now - item.addedAt < CART_EXPIRY_MS
        );
        
        setMiniCartItems(validItems);
        
        // Save cleaned cart
        if (validItems.length !== items.length) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validItems));
        }
      }
    } catch (error) {
      console.error('Failed to load mini cart:', error);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(miniCartItems));
    } catch (error) {
      console.error('Failed to save mini cart:', error);
    }
  }, [miniCartItems]);

  const itemCount = miniCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal (assuming price is in format "$XX.XX" or numeric)
  const subtotal = miniCartItems.reduce((sum, item) => {
    const price = parsePrice(item.tool.price) || 0;
    return sum + (price * item.quantity);
  }, 0);

  const openMiniCart = useCallback(() => {
    setMiniCartOpen(true);
  }, []);

  const closeMiniCart = useCallback(() => {
    setMiniCartOpen(false);
  }, []);

  const toggleMiniCart = useCallback(() => {
    setMiniCartOpen(prev => !prev);
  }, []);

  const addToMiniCart = useCallback((tool: ToolMetadata) => {
    trackEvent('ADD_TO_CART', undefined, tool.slug);
    setMiniCartItems(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(item => item.tool.slug === tool.slug);
      
      if (existingIndex !== -1) {
        // Update quantity
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      // Check max items
      if (prev.length >= MAX_CART_ITEMS) {
        console.warn('Maximum cart items reached');
        return prev;
      }

      // Add new item
      return [...prev, {
        id: generateItemId(tool),
        tool,
        quantity: 1,
        addedAt: Date.now(),
      }];
    });
  }, [trackEvent]);

  const removeFromMiniCart = useCallback((itemId: string) => {
    setMiniCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromMiniCart(itemId);
      return;
    }

    setMiniCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeFromMiniCart]);

  const clearMiniCart = useCallback(() => {
    setMiniCartItems([]);
  }, []);

  const proceedToCheckout = useCallback(() => {
    // In production, this would redirect to checkout
    // or open a checkout modal
    console.log('Proceeding to checkout with items:', miniCartItems);
    
    // Generate checkout URL with cart data
    const cartData = encodeURIComponent(JSON.stringify(
      miniCartItems.map(item => ({
        slug: item.tool.slug,
        quantity: item.quantity,
      }))
    ));
    
    window.location.href = `/checkout?cart=${cartData}`;
  }, [miniCartItems]);

  return {
    miniCartItems,
    miniCartOpen,
    itemCount,
    subtotal,
    openMiniCart,
    closeMiniCart,
    toggleMiniCart,
    addToMiniCart,
    removeFromMiniCart,
    updateQuantity,
    clearMiniCart,
    proceedToCheckout,
  };
}

// Helper functions
function generateItemId(tool: ToolMetadata): string {
  return `${tool.slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  
  // Remove currency symbols and whitespace
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
