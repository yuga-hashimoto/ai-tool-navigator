"use client";

import { useEffect } from "react";
import useWebVitals, { WebVitalsMetrics } from "@/hooks/useWebVitals";
import { sendGAEvent } from "@/lib/analytics";

interface WebVitalsProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function WebVitalsProvider({ children, enabled = true }: WebVitalsProviderProps) {
  const handleMetrics = (metric: WebVitalsMetrics) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        page: metric.page,
      });
    }

    // Send custom event to GA4 for detailed tracking
    sendGAEvent("web_vitals", {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
      page_path: metric.page,
      metric_id: metric.id,
    });
  };

  useWebVitals(handleMetrics, {
    sendToGA4: true,
    includeUserAgent: false,
  });

  return <>{children}</>;
}
