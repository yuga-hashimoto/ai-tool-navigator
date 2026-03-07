"use client";

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { GoogleAdsensePlaceholder } from './GoogleAdsensePlaceholder';

interface GoogleAdsenseProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function GoogleAdsense({ slot, format = 'auto', layoutKey, className, style }: GoogleAdsenseProps) {
  const [hasError, setHasError] = useState(false);
  const [isFilled, setIsFilled] = useState(true);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!clientId || !slot) return;
    try {
      // @ts-expect-error - adsbygoogle is added to window by the script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
      window.setTimeout(() => setHasError(true), 0);
    }
  }, [clientId, slot]);

  useEffect(() => {
    if (!slot) return;

    const element = adRef.current;
    if (!element) return;

    const syncFillState = () => {
      const status = element.getAttribute('data-ad-status');
      setIsFilled(status !== 'unfilled');
    };

    syncFillState();

    const observer = new MutationObserver(syncFillState);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
    });

    const timeoutId = window.setTimeout(syncFillState, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, [slot]);

  if (!clientId) {
    return slot ? <GoogleAdsensePlaceholder /> : null;
  }

  if (hasError) return null;

  if (!slot) {
    return (
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        display: isFilled ? undefined : 'none',
        ...style,
      }}
      aria-hidden={!isFilled}
    >
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
      />
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
}
