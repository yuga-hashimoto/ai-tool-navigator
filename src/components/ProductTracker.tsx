'use client';

import { useEffect } from 'react';
import { useProductTracking } from '@/hooks/useProductTracking';

export function ProductTracker({ slug }: { slug: string }) {
  const { trackView } = useProductTracking(slug);

  useEffect(() => {
    trackView();
  }, [trackView]);

  return null;
}
