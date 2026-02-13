"use client";

import { useAdOptimization } from '@/hooks/useAdOptimization';
import { GoogleAdsense } from './GoogleAdsense';

interface DynamicAdUnitProps {
  index: number;
  type: 'grid' | 'content';
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DynamicAdUnit({ index, type, slot, format, layoutKey, className, style }: DynamicAdUnitProps) {
  const { shouldShowAd } = useAdOptimization();

  if (!shouldShowAd(index, type)) {
    return null;
  }

  return (
    <GoogleAdsense
      slot={slot}
      format={format}
      layoutKey={layoutKey}
      className={className}
      style={style}
    />
  );
}
