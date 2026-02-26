'use client';

import { useEffect, useRef } from 'react';
import { getOrCreateSessionId } from '@/lib/affiliate-tracking';

interface InteractionTrackerProps {
  toolSlug: string;
  userId?: string;
}

export function InteractionTracker({ toolSlug, userId }: InteractionTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Prevent double tracking in strict mode or re-renders
    if (trackedRef.current) return;

    const trackView = async () => {
      try {
        // Ensure session ID is created/available
        const visitorId = getOrCreateSessionId();

        await fetch('/api/track/interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toolSlug,
            type: 'VIEW',
            visitorId, // Pass explicitly just in case cookies aren't sent or parsed correctly
            userId,
          }),
        });

        trackedRef.current = true;
      } catch (error) {
        console.error('Failed to track interaction:', error);
      }
    };

    trackView();
  }, [toolSlug]);

  return null;
}
