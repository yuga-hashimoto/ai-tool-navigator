"use client";

import { useId } from 'react';
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
  forceShow?: boolean;
}

export function DynamicAdUnit({
  index,
  type,
  slot: propSlot,
  format,
  layoutKey,
  className,
  style,
  forceShow = false,
}: DynamicAdUnitProps) {
  const { shouldShowAd, adNetwork } = useAdOptimization();
  const reactId = useId().replace(/:/g, "");
  const divId = `div-gpt-ad-${type}-${index}-${reactId}`;
  const requestedSlot =
    propSlot && ["grid", "content", "sidebar"].includes(propSlot)
      ? AD_CONFIG.adsense.slots[propSlot as "grid" | "content" | "sidebar"]
      : propSlot;

  // Sidebar always shows, others check density via shouldShowAd
  if (!forceShow && type !== 'sidebar' && !shouldShowAd(index, type as 'grid' | 'content')) {
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
    const slotId = requestedSlot || adsenseConfig.slots[type];

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
