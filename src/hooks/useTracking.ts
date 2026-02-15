import { useCallback } from 'react';

const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sid = localStorage.getItem('sessionId');
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', sid);
  }
  return sid;
};

export const useTracking = () => {
  const trackEvent = useCallback(async (
    eventType: string,
    productSlug?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any
  ) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          eventType,
          productSlug,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Failed to track event', error);
    }
  }, []);

  return { trackEvent };
};
