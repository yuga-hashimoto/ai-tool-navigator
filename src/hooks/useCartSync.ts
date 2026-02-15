"use client";

import { useEffect, useRef } from 'react';

// Storage keys
const SESSION_ID_KEY = 'abandonment_session_id';
const VISITOR_EMAIL_KEY = 'visitor_email';

interface CartItem {
  id: string;
  tool: {
    slug: string;
    name: string;
    price?: string;
  };
  quantity: number;
}

interface UseCartSyncProps {
  cartItems: CartItem[];
}

/**
 * Hook to sync cart data with the server for abandonment recovery
 */
export function useCartSync({ cartItems }: UseCartSyncProps) {
  // Use a ref to store the timeout ID for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    // Debounce the API call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (cartItems.length > 0) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const visitorEmail = localStorage.getItem(VISITOR_EMAIL_KEY);

          // Format items for the API
          const items = cartItems.map(item => ({
            toolSlug: item.tool.slug,
            toolName: item.tool.name,
            price: parsePrice(item.tool.price),
            quantity: item.quantity,
          }));

          const response = await fetch('/api/abandonment/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              items,
              visitorEmail: visitorEmail || undefined,
              source: 'cart_sync'
            }),
          });

          if (!response.ok) {
            console.warn('Failed to sync cart:', await response.text());
          }
        } catch (error) {
          console.error('Error syncing cart:', error);
        }
      }, 2000); // 2 second debounce
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cartItems]);
}

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
