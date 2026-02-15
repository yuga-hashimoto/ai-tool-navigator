'use client';

import { useCallback } from 'react';
import { getOrCreateSessionId } from '@/lib/affiliate-tracking';

export function useProductTracking(productSlug: string) {
  const trackEvent = useCallback(async (type: string, metadata?: Record<string, any>) => {
    try {
      const sessionId = getOrCreateSessionId();
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productSlug,
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

  return { trackEvent, trackView, trackClick };
}
