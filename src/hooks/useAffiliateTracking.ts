"use client";

import { useEffect, useCallback } from "react";
import {
  getAttribution,
  recordAffiliateClick,
  recordAffiliateImpression,
  recordConversion as recordAffiliateConversion,
  clearAttribution,
  hasTrackingOptOut,
  buildAffiliateUrl,
  parseUtmParams,
  extractAffiliateId,
  AttributionData,
  AffiliateEventType,
} from "@/lib/affiliate-tracking";

interface UseAffiliateOptions {
  toolSlug?: string;
  toolName?: string;
  affiliateId?: string;
  autoTrack?: boolean;
  autoTrackImpressions?: boolean;
}

interface UseAffiliateReturn {
  attribution: AttributionData | null;
  recordClick: (options?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    position?: string;
  }) => void;
  recordImpression: (position?: string) => void;
  recordConversion: (options: {
    conversionType: "signup" | "purchase" | "trial" | "upgrade";
    value?: number;
    currency?: string;
  }) => void;
  clearTracking: () => void;
  isOptedOut: boolean;
  buildUrl: (baseUrl: string, options?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  }) => string;
}

export function useAffiliate(options: UseAffiliateOptions = {}): UseAffiliateReturn {
  const {
    toolSlug,
    toolName,
    affiliateId,
    autoTrack = false,
    autoTrackImpressions = false,
  } = options;

  // Get current attribution
  const attribution = getAttribution();

  // Check for opt-out
  const isOptedOut = hasTrackingOptOut();

  // Record a click
  const recordClick = useCallback(
    (clickOptions?: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
      position?: string;
    }) => {
      if (isOptedOut || !toolSlug) return;

      const id = affiliateId || extractAffiliateId(window.location.href) || "unknown";

      recordAffiliateClick({
        toolSlug,
        toolName: toolName || "",
        affiliateId: id,
        source: clickOptions?.source || "direct",
        medium: clickOptions?.medium || "referral",
        campaign: clickOptions?.campaign || "",
        content: clickOptions?.content,
        term: clickOptions?.term,
        pageUrl: window.location.href,
        position: clickOptions?.position,
      });
    },
    [toolSlug, toolName, affiliateId, isOptedOut]
  );

  // Record an impression
  const recordImpression = useCallback(
    (position?: string) => {
      if (isOptedOut || !toolSlug || !toolName) return;

      const id = affiliateId || extractAffiliateId(window.location.href) || "unknown";

      recordAffiliateImpression(toolSlug, toolName, id, position);
    },
    [toolSlug, toolName, affiliateId, isOptedOut]
  );

  // Record a conversion
  const recordConversion = useCallback(
    (conversionOptions: {
      conversionType: "signup" | "purchase" | "trial" | "upgrade";
      value?: number;
      currency?: string;
    }) => {
      if (isOptedOut || !toolSlug) return;

      const attr = attribution;
      const id = affiliateId || attr?.affiliateId || "direct";

      recordAffiliateConversion({
        affiliateId: id,
        toolSlug,
        conversionType: conversionOptions.conversionType,
        value: conversionOptions.value,
        currency: conversionOptions.currency,
        attributionModel: attr ? "last_touch" : "direct",
        attributedAffiliateId: id,
      });
    },
    [toolSlug, affiliateId, attribution, isOptedOut]
  );

  // Clear all tracking data
  const clearTracking = useCallback(() => {
    clearAttribution();
  }, []);

  // Build a tracked URL
  const buildUrl = useCallback(
    (baseUrl: string, urlOptions?: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
    }) => {
      const id = affiliateId || attribution?.affiliateId || "unknown";

      return buildAffiliateUrl(baseUrl, {
        affiliateId: id,
        source: urlOptions?.source || "affiliate",
        medium: urlOptions?.medium || "referral",
        campaign: urlOptions?.campaign || "",
        content: urlOptions?.content,
        term: urlOptions?.term,
      });
    },
    [affiliateId, attribution]
  );

  // Auto-track clicks on tracked links
  useEffect(() => {
    if (!autoTrack) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a[data-affiliate-id]") as HTMLAnchorElement | null;

      if (link) {
        recordClick({
          position: link.dataset.position,
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [autoTrack, recordClick]);

  // Auto-track impressions
  useEffect(() => {
    if (!autoTrackImpressions || !toolSlug || !toolName) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const position = element.dataset.position || "unknown";
            recordImpression(position);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all affiliate-tracked elements
    document.querySelectorAll("[data-affiliate-id]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [autoTrackImpressions, toolSlug, toolName, recordImpression]);

  return {
    attribution,
    recordClick,
    recordImpression,
    recordConversion,
    clearTracking,
    isOptedOut,
    buildUrl,
  };
}

/**
 * Hook for tracking specific affiliate events
 */
export function useAffiliateEvent(
  eventType: AffiliateEventType,
  data?: Record<string, string | number | boolean>
) {
  const handleEvent = useCallback(() => {
    if (hasTrackingOptOut()) return;

    // Dispatch custom event for tracking
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(`affiliate:${eventType}`, {
          detail: data,
        })
      );
    }
  }, [eventType, data]);

  return { handleEvent, eventType };
}

/**
 * Hook for reading URL tracking parameters
 */
export function useAffiliateParams() {
  useEffect(() => {
    if (typeof window === "undefined") return null;

    const params = parseUtmParams(window.location.href);
    const affiliateId = extractAffiliateId(window.location.href);

    return {
      ...params,
      affiliateId,
      hasTracking: !!(params.utm_source || affiliateId),
    };
  }, []);
}
