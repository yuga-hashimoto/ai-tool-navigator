"use client";

import { useEffect, useState } from 'react';
import { AdNetwork } from '@/lib/ad-config';

type AdDensity = 'low' | 'medium' | 'high';

export function useAdOptimization() {
  const [density, setDensity] = useState<AdDensity>('medium'); // Default to medium before hydration
  const [adNetwork, setAdNetwork] = useState<AdNetwork>('adsense'); // Default to adsense

  useEffect(() => {
    // Check session storage for density
    const storedDensity = sessionStorage.getItem('ad_density') as AdDensity;
    if (storedDensity && ['low', 'medium', 'high'].includes(storedDensity)) {
      setDensity(storedDensity);
    } else {
      // Randomize density
      const densities: AdDensity[] = ['low', 'medium', 'high'];
      const randomDensity = densities[Math.floor(Math.random() * densities.length)];
      setDensity(randomDensity);
      sessionStorage.setItem('ad_density', randomDensity);
    }

    // Check session storage for ad network
    const storedNetwork = sessionStorage.getItem('ad_network') as AdNetwork;
    if (storedNetwork && ['adsense', 'gam'].includes(storedNetwork)) {
      setAdNetwork(storedNetwork);
    } else {
      // Randomize network (50/50 split)
      const networks: AdNetwork[] = ['adsense', 'gam'];
      const randomNetwork = networks[Math.floor(Math.random() * networks.length)];
      setAdNetwork(randomNetwork);
      sessionStorage.setItem('ad_network', randomNetwork);
    }
  }, []);

  const shouldShowAd = (index: number, type: 'grid' | 'content'): boolean => {
    // Indexes are 0-based index from map
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

  return { density, shouldShowAd, adNetwork };
}
