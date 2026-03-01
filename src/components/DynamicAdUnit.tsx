"use client";

import { useMemo } from 'react';
import { useAdOptimization } from '@/hooks/useAdOptimization';
import { GoogleAdsense } from './GoogleAdsense';
import { GoogleAdManager } from './GoogleAdManager';
import { AD_CONFIG } from '@/lib/ad-config';

interface DynamicAdUnitProps {
  index: number;
  type: 'grid' | 'content' | 'sidebar';
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DynamicAdUnit({ index, type, slot: propSlot, format, layoutKey, className, style }: DynamicAdUnitProps) {
  const { shouldShowAd, adNetwork } = useAdOptimization();

  // Sidebar always shows, others check density via shouldShowAd
  const divId = useMemo(() => `div-gpt-ad-${type}-${index}-${Math.random().toString(36).substring(7)}`, [type, index]);

  if (type !== 'sidebar' && !shouldShowAd(index, type as 'grid' | 'content')) {
    return null;
  }

  if (adNetwork === 'gam') {
    const gamConfig = AD_CONFIG.gam;
    const path = gamConfig.slots[type];
    const size = gamConfig.sizes[type];

    if (!path) return null;

    return (
      <GoogleAdManager
        path={path}
        size={size}
        id={divId}
        className={className}
        style={style}
      />
    );
  } else {
    // AdSense
    const adsenseConfig = AD_CONFIG.adsense;
    // Prefer config from AD_CONFIG, fallback to propSlot
    const slotId = adsenseConfig.slots[type] || propSlot;

    if (!slotId) return null;

    return (
      <GoogleAdsense
        slot={slotId}
        format={format}
        layoutKey={layoutKey}
        className={className}
        style={style}
      />
    );
  }
}
