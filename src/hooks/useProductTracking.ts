'use client';

import { useCallback } from 'react';
import { getOrCreateSessionId } from '@/lib/affiliate-tracking';

export function useProductTracking(productSlug?: string) {
  const trackEvent = useCallback(async (type: string, metadata?: Record<string, any>, slug?: string) => {
    const targetSlug = slug || productSlug;
    if (!targetSlug) {
      console.warn('No product slug provided for tracking');
      return;
    }

    try {
      const sessionId = getOrCreateSessionId();
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: targetSlug,
          type,
          sessionId,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Error tracking product event:', error);
    }
  }, [productSlug]);

  const trackView = useCallback(() => {
    trackEvent('VIEW');
  }, [trackEvent]);

  const trackClick = useCallback(() => {
    trackEvent('CLICK');
  }, [trackEvent]);

  const trackAddToCart = useCallback(() => {
    trackEvent('ADD_TO_CART');
  }, [trackEvent]);

  const trackPurchase = useCallback(() => {
    trackEvent('PURCHASE');
  }, [trackEvent]);

  return { trackEvent, trackView, trackClick, trackAddToCart, trackPurchase };
}
