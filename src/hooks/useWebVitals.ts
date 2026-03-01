/**
 * Web Vitals Tracking Hook
 * Collects Core Web Vitals metrics and sends them to analytics
 */

"use client";

import { useEffect, useCallback } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from "web-vitals";

export interface WebVitalsMetrics {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  page: string;
  timestamp: number;
  userAgent?: string;
}

export interface AlertThreshold {
  metric: string;
  warning: number;
  critical: number;
}

export const DEFAULT_ALERT_THRESHOLDS: AlertThreshold[] = [
  { metric: "LCP", warning: 2500, critical: 4000 },
  { metric: "FCP", warning: 1800, critical: 3000 },
  { metric: "CLS", warning: 0.1, critical: 0.25 },
  { metric: "FID", warning: 100, critical: 300 },
  { metric: "TTI", warning: 3800, critical: 7300 },
  { metric: "TBT", warning: 300, critical: 600 },
  { metric: "TTFB", warning: 800, critical: 1800 },
];

export const getMetricRating = (name: string, value: number): "good" | "needs-improvement" | "poor" => {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    TTI: { good: 3800, poor: 7300 },
    TBT: { good: 200, poor: 600 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name];
  if (!threshold) return "needs-improvement";

  if (value <= threshold.good) return "good";
  if (value >= threshold.poor) return "poor";
  return "needs-improvement";
};

export const checkAlertThresholds = (
  metric: WebVitalsMetrics,
  thresholds: AlertThreshold[] = DEFAULT_ALERT_THRESHOLDS
): { triggered: boolean; level: "warning" | "critical" | null } => {
  const threshold = thresholds.find((t) => t.metric === metric.name);
  if (!threshold) return { triggered: false, level: null };

  if (metric.value >= threshold.critical) {
    return { triggered: true, level: "critical" };
  }
  if (metric.value >= threshold.warning) {
    return { triggered: true, level: "warning" };
  }
  return { triggered: false, level: null };
};

type MetricsCallback = (metric: WebVitalsMetrics) => void;

export const useWebVitals = (
  onMetrics?: MetricsCallback,
  options?: {
    includeUserAgent?: boolean;
    alertThresholds?: AlertThreshold[];
    sendToGA4?: boolean;
    ga4MeasurementId?: string;
  }
) => {
  const { includeUserAgent = true, alertThresholds = DEFAULT_ALERT_THRESHOLDS, sendToGA4 = true, ga4MeasurementId } = options || {};

  const buildMetric = useCallback(
    (metric: Metric): WebVitalsMetrics => {
      return {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: getMetricRating(metric.name, metric.value),
        delta: metric.delta,
        page: window.location.pathname,
        timestamp: Date.now(),
        userAgent: includeUserAgent ? navigator.userAgent : undefined,
      };
    },
    [includeUserAgent]
  );

  const handleMetric = useCallback(
    (metric: Metric) => {
      const webVitalsMetric = buildMetric(metric);

      // Send to custom callback
      if (onMetrics) {
        onMetrics(webVitalsMetric);
      }

      // Check thresholds and trigger alerts
      const alert = checkAlertThresholds(webVitalsMetric, alertThresholds);
      if (alert.triggered) {
        console.warn(`[Web Vitals Alert] ${alert.level?.toUpperCase()}: ${metric.name} = ${metric.value} on ${window.location.pathname}`);
        // You can extend this to send alerts to Slack, email, etc.
      }

      // Send to GA4 if enabled
      if (sendToGA4 && typeof window !== "undefined" && window.gtag) {
        window.gtag("event", metric.name, {
          event_category: "Web Vitals",
          event_label: webVitalsMetric.page,
          value: Math.round(metric.value),
          metric_rating: webVitalsMetric.rating,
          metric_delta: Math.round(metric.delta),
        });
      }

      // Send to custom analytics endpoint
      if (typeof window !== "undefined") {
        const endpoint = "/api/analytics/web-vitals";
        try {
          void fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webVitalsMetric),
            keepalive: true,
          });
        } catch (error) {
          console.error("[Web Vitals] Failed to send to analytics:", error);
        }
      }
    },
    [buildMetric, onMetrics, alertThresholds, sendToGA4]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Subscribe to all Web Vitals metrics
    const subscriptions = [
      onFCP(handleMetric),
      onLCP(handleMetric),
      onCLS(handleMetric),
      onINP(handleMetric),
      onTTFB(handleMetric),
    ];

    // TTI is not directly available in web-vitals, but we can approximate with TBT
    // For now, we'll use FID as a proxy for interactivity

    return () => {
      subscriptions.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [handleMetric]);
};

export default useWebVitals;
