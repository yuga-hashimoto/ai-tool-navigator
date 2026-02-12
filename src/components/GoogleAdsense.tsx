'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { GoogleAdsensePlaceholder } from './GoogleAdsensePlaceholder';

interface GoogleAdsenseProps {
  slot: string;
  format?: string;
  responsive?: string;
  layout?: string;
  layoutKey?: string;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any[];
  }
}

export function GoogleAdsense({
  slot,
  format = 'auto',
  responsive = 'true',
  layout,
  layoutKey,
  style,
  className,
}: GoogleAdsenseProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <div className={className} style={style}>
        <GoogleAdsensePlaceholder />
      </div>
    );
  }

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
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
}
