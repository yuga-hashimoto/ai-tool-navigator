"use client";

import { useEffect, useState } from 'react';
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
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    try {
      // @ts-expect-error - adsbygoogle is added to window by the script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
      setHasError(true);
    }
  }, [clientId]);

  if (!clientId) {
    return <GoogleAdsensePlaceholder />;
  }

  if (hasError) return null;

  return (
    <div className={className} style={{ overflow: 'hidden', ...style }}>
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
      />
      <ins
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
