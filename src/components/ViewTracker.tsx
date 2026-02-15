"use client";

import { useEffect, useRef } from 'react';
import { useTracking } from '@/hooks/useTracking';

interface ViewTrackerProps {
  productSlug?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export const ViewTracker = ({ productSlug, metadata }: ViewTrackerProps) => {
  const { trackEvent } = useTracking();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      trackEvent('VIEW', productSlug, metadata);
      tracked.current = true;
    }
  }, [trackEvent, productSlug, metadata]);

  return null;
};
