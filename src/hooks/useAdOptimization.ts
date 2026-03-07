"use client";

import { useEffect, useState } from 'react';
import { AD_CONFIG, AdNetwork } from '@/lib/ad-config';

type AdDensity = 'low' | 'medium' | 'high';

function getAvailableNetworks(): AdNetwork[] {
  const hasGamConfig =
    Boolean(AD_CONFIG.gam.networkId) &&
    Object.values(AD_CONFIG.gam.slots).some(Boolean);

  return hasGamConfig ? ['adsense', 'gam'] : ['adsense'];
}

function getInitialDensity(): AdDensity {
  if (typeof window === 'undefined') {
    return 'medium';
  }

  const storedDensity = sessionStorage.getItem('ad_density') as AdDensity | null;
  if (storedDensity && ['low', 'medium', 'high'].includes(storedDensity)) {
    return storedDensity;
  }

  const densities: AdDensity[] = ['low', 'medium', 'high'];
  return densities[Math.floor(Math.random() * densities.length)];
}

function getInitialNetwork(): AdNetwork {
  const availableNetworks = getAvailableNetworks();

  if (typeof window === 'undefined') {
    return availableNetworks[0];
  }

  const storedNetwork = sessionStorage.getItem('ad_network') as AdNetwork | null;
  if (storedNetwork && availableNetworks.includes(storedNetwork)) {
    return storedNetwork;
  }

  return availableNetworks[Math.floor(Math.random() * availableNetworks.length)];
}

export function useAdOptimization() {
  const [density] = useState<AdDensity>(() => getInitialDensity());
  const [adNetwork] = useState<AdNetwork>(() => getInitialNetwork());

  useEffect(() => {
    sessionStorage.setItem('ad_density', density);
    sessionStorage.setItem('ad_network', adNetwork);
  }, [adNetwork, density]);

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
