"use client";

import {
  recordAffiliateClick,
  recordAffiliateImpression,
  buildAffiliateUrl,
  hasTrackingOptOut,
} from "@/lib/affiliate-tracking";
import { ReactNode, useEffect } from "react";

interface AffiliateLinkButtonProps {
  href: string;
  toolSlug: string;
  toolName: string;
  affiliateId?: string;
  className?: string;
  children: ReactNode;
  position?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  trackImpression?: boolean;
  onClick?: () => void;
}

export function AffiliateLinkButton({
  href,
  toolSlug,
  toolName,
  affiliateId,
  className,
  children,
  position = "tool_page",
  source = "ai-tools-navigator",
  medium = "affiliate",
  campaign,
  content,
  term,
  trackImpression = false,
  onClick,
}: AffiliateLinkButtonProps) {
  const trackingUrl = affiliateId
    ? buildAffiliateUrl(href, {
        affiliateId,
        source,
        medium,
        campaign,
        content,
        term,
      })
    : href;

  // Record impression on mount (if enabled)
  useEffect(() => {
    if (trackImpression && !hasTrackingOptOut()) {
      const id = affiliateId || extractAffiliateId(href) || "unknown";
      recordAffiliateImpression(toolSlug, toolName, id, position);
    }
  }, [toolSlug, toolName, affiliateId, href, position, trackImpression]);

  const handleClick = async () => {
    // Don't track if user has opted out
    if (hasTrackingOptOut()) {
      onClick?.();
      return;
    }

    // Get the actual affiliate ID to use
    const id = affiliateId || extractAffiliateId(href) || "unknown";

    // Record the click
    recordAffiliateClick({
      toolSlug,
      toolName,
      affiliateId: id,
      source,
      medium,
      campaign,
      content,
      term,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      position,
    });

    void fetch("/api/affiliate/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toolSlug,
        toolName,
        affiliateId: id !== "unknown" ? id : undefined,
        affiliateSlug: toolSlug,
        source,
        medium,
        campaign,
        content,
        term,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        position,
      }),
      keepalive: true,
    }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[AffiliateLinkButton] Failed to persist affiliate click", error);
      }
    });

    // Call custom onClick handler
    onClick?.();
  };

  return (
    <a
      href={trackingUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={handleClick}
      data-affiliate-id={affiliateId || extractAffiliateId(href)}
      data-tool-slug={toolSlug}
    >
      {children}
    </a>
  );
}

/**
 * Extract affiliate ID from URL
 */
function extractAffiliateId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const ref = urlObj.searchParams.get("ref");
    if (ref) return ref;
    const affiliate = urlObj.searchParams.get("affiliate");
    if (affiliate) return affiliate;
    const pathMatch = urlObj.pathname.match(/\/ref\/([^/?#]+)/);
    if (pathMatch) return pathMatch[1];
    return null;
  } catch {
    return null;
  }
}
