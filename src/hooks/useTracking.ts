import { useEffect } from 'react';

export function useTrackView(slug: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Generate or retrieve session ID (simple implementation)
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    const track = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType: 'VIEW',
            slug,
            sessionId,
          }),
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    track();
  }, [slug]);
}

export async function trackEvent(eventType: string, data: Record<string, any>) {
    if (typeof window === 'undefined') return;

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType,
            sessionId,
            ...data
          }),
        });
      } catch (error) {
        console.error('Failed to track event:', error);
      }
}
