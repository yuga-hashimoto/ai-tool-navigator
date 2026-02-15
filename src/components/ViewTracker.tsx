'use client';

import { useTrackView } from '@/hooks/useTracking';

export function ViewTracker({ slug }: { slug: string }) {
  useTrackView(slug);
  return null;
}
