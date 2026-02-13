"use client";

import { useEffect, useState } from 'react';

type AdDensity = 'low' | 'medium' | 'high';

interface AdConfig {
  density: AdDensity;
}

export function useAdOptimization() {
  const [density, setDensity] = useState<AdDensity>('medium'); // Default to medium before hydration

  useEffect(() => {
    // Check session storage
    const stored = sessionStorage.getItem('ad_density') as AdDensity;
    if (stored && ['low', 'medium', 'high'].includes(stored)) {
      setDensity(stored);
    } else {
      // Randomize
      const densities: AdDensity[] = ['low', 'medium', 'high'];
      const random = densities[Math.floor(Math.random() * densities.length)];
      setDensity(random);
      sessionStorage.setItem('ad_density', random);
    }
  }, []);

  const shouldShowAd = (index: number, type: 'grid' | 'content'): boolean => {
    // Indexes are 1-based usually (passed from loop or count), but let's assume they are passed as 0-based index from map
    // Wait, let's standardize.
    // In ToolGrid map: index is 0, 1, 2...
    // In Content (paragraphs): count starts at 1 usually.
    // Let's assume input is 1-based count or we adjust.
    // If input is 0-based index: (index + 1) % interval === 0.

    const count = index + 1;

    if (type === 'grid') {
      // Grid: insert after N items
      if (density === 'low') return count % 12 === 0;
      if (density === 'medium') return count % 9 === 0;
      if (density === 'high') return count % 6 === 0;
    }

    if (type === 'content') {
      // Content: insert after N paragraphs
      if (density === 'low') return count % 8 === 0;
      if (density === 'medium') return count % 4 === 0;
      if (density === 'high') return count % 3 === 0;
    }

    return false;
  };

  return { density, shouldShowAd };
}
