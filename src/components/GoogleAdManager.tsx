"use client";

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface GoogleAdManagerProps {
  path: string;
  size: [number, number] | [number, number][];
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

export function GoogleAdManager({ path, size, id, className, style }: GoogleAdManagerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slotRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googletag = (window as any).googletag || {};
    googletag.cmd = googletag.cmd || [];

    googletag.cmd.push(() => {
      // Destroy existing slot if any
      if (slotRef.current) {
        googletag.destroySlots([slotRef.current]);
      }

      const slot = googletag.defineSlot(path, size, id);
      if (slot) {
        slot.addService(googletag.pubads());
        googletag.enableServices();
        googletag.display(id);
        slotRef.current = slot;
      }
    });

    return () => {
      googletag.cmd.push(() => {
        if (slotRef.current) {
          googletag.destroySlots([slotRef.current]);
          slotRef.current = null;
        }
      });
    };
  }, [path, size, id]);

  // Determine min dimensions for placeholder to avoid layout shift
  const minWidth = Array.isArray(size[0]) ? (size as [number, number][])[0][0] : (size as [number, number])[0];
  const minHeight = Array.isArray(size[0]) ? (size as [number, number][])[0][1] : (size as [number, number])[1];

  return (
    <div className={className} style={style}>
      <Script
        id="gpt-init"
        strategy="afterInteractive"
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
      />
      <div
        id={id}
        style={{
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      />
    </div>
  );
}
