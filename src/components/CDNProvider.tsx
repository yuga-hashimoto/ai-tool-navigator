'use client';

import { useState, useEffect } from 'react';
import { getCDNUrl, isCDNEnabled } from './cdn';

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
    <img
      {...props}
      src={currentSrc}
      onError={handleError}
    />
  );
}

interface CDNScriptProps {
  src: string;
  strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * CDN-aware Script loader
 * 
 * Loads scripts from CDN with fallback to local.
 * 
 * Usage:
 *   <CDNScript src="/js/analytics.js" strategy="afterInteractive" />
 */
export function CDNScript({
  src,
  strategy = 'afterInteractive',
  onLoad,
  onError,
}: CDNScriptProps) {
  const [scriptSrc, setScriptSrc] = useState<string>('');
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const cdnEnabled = isCDNEnabled();

  useEffect(() => {
    const url = cdnEnabled ? getCDNUrl(src) : src;
    setScriptSrc(url);
  }, [src, cdnEnabled]);

  const handleError = () => {
    if (!hasTriedFallback) {
      setScriptSrc(src); // Try original
      setHasTriedFallback(true);
    } else {
      onError?.();
    }
  };

  if (!scriptSrc) {
    return null;
  }

  return (
    <script
      src={scriptSrc}
      strategy={strategy}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

interface CDNLinkProps {
  href: string;
  as?: string;
  rel?: string;
  onLoad?: () => void;
}

/**
 * CDN-aware Link prefetcher
 * 
 * Prefetches assets from CDN for faster page loads.
 * 
 * Usage:
 *   <CDNLink href="/css/styles.css" rel="stylesheet" />
 */
export function CDNLink({ href, as, rel = 'stylesheet', onLoad }: CDNLinkProps) {
  const cdnEnabled = isCDNEnabled();

  useEffect(() => {
    if (cdnEnabled) {
      const cdnHref = getCDNUrl(href);
      // Prefetch the resource
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = as || (href.endsWith('.css') ? 'style' : 'script');
      link.href = cdnHref;
      document.head.appendChild(link);
    }
  }, [href, as, cdnEnabled]);

  return (
    <link
      href={cdnEnabled ? getCDNUrl(href) : href}
      rel={rel}
      as={as}
      onLoad={onLoad}
    />
  );
}

export { getCDNUrl, isCDNEnabled };
