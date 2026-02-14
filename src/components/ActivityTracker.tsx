"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface ActivityTrackerProps {
  type: "VIEW" | "CHECKOUT" | "PURCHASE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
}

export function ActivityTracker({ type, details }: ActivityTrackerProps) {
  const pathname = usePathname();
  const trackedRef = useRef(false);

  useEffect(() => {
    // Reset tracked status if pathname changes (though component usually remounts)
    // But to be safe if it's used in a persistent layout
    // trackedRef.current = false;
    // Wait, if I reset it here, it will infinite loop if I'm not careful with dependencies.
    // Let's rely on mounting behavior for now.

    if (trackedRef.current) return;
    trackedRef.current = true;

    const trackActivity = async () => {
      try {
        const payload = {
          type,
          details: {
            ...details,
            pathname,
            url: window.location.href,
          },
          location: null,
        };

        await fetch("/api/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Failed to track activity:", error);
      }
    };

    const timer = setTimeout(trackActivity, 1000);

    return () => clearTimeout(timer);
  }, [type, details, pathname]);

  return null;
}
