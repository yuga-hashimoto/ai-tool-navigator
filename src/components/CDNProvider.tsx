'use client';

import { useState, useEffect } from 'react';
import { getCDNUrl, isCDNEnabled } from '@/lib/cdn';

interface CDNImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  onCDNError?: () => void;
}

/**
 * CDN-aware Image component
 * 
 * Automatically uses CDN URL and falls back to original on error.
 * 
 * Usage:
 *   <CDNImage src="/images/photo.jpg" alt="Photo" />
 *   <CDNImage src="/images/photo.jpg" fallbackSrc="/images/placeholder.jpg" />
 */
export function CDNImage({
  src,
  fallbackSrc,
  onCDNError,
  ...props
}: CDNImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const cdnEnabled = isCDNEnabled();

  useEffect(() => {
    // Reset state when src changes
    setHasTriedFallback(false);
    setCurrentSrc(cdnEnabled ? getCDNUrl(src) : src);
  }, [src, cdnEnabled]);

  const handleError = () => {
    if (!hasTriedFallback && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasTriedFallback(true);
    } else if (!hasTriedFallback) {
      // Try original URL as fallback
      setCurrentSrc(src);
      setHasTriedFallback(true);
    } else {
      onCDNError?.();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      {...props}
      src={currentSrc}
      loading="lazy"
      onError={handleError}
    />
  );
}

export { getCDNUrl, isCDNEnabled };
