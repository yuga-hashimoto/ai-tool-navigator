/**
 * Affiliate Tracking and Attribution Library
 * 
 * This module provides utilities for tracking affiliate link clicks,
 * attribution management, and conversion tracking.
 * 
 * Privacy Compliance:
 * - GDPR: Minimizes personal data, provides opt-out mechanisms
 * - CCPA: California consumer privacy considerations
 */

import { sendGAEvent } from "./analytics";

// Affiliate link tracking configuration
export interface AffiliateConfig {
  campaignParam: string;
  sourceParam: string;
  mediumParam: string;
  contentParam: string;
  termParam: string;
  cookieRetentionDays: number;
}

// Default configuration
export const defaultAffiliateConfig: AffiliateConfig = {
  campaignParam: "utm_campaign",
  sourceParam: "utm_source",
  mediumParam: "utm_medium",
  contentParam: "utm_content",
  termParam: "utm_term",
  cookieRetentionDays: 90, // 90 days for affiliate attribution window
};

// Tracking event types
export type AffiliateEventType = 
  | "affiliate_click"
  | "affiliate_impression"
  | "affiliate_conversion"
  | "affiliate_signup"
  | "affiliate_purchase";

// Attribution models
export type AttributionModel = 
  | "first_touch"
  | "last_touch"
  | "linear"
  | "time_decay"
  | "position_based";

// Affiliate click event data
export interface AffiliateClickData {
  toolSlug: string;
  toolName: string;
  affiliateId: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
  timestamp: string;
  referrer?: string;
  userAgent?: string;
  pageUrl: string;
  position?: string;
}

// Conversion event data
export interface AffiliateConversionData {
  affiliateId: string;
  toolSlug: string;
  conversionType: "signup" | "purchase" | "trial" | "upgrade";
  value?: number;
  currency?: string;
  attributionModel: AttributionModel;
  attributedAffiliateId?: string;
  timestamp: string;
}

// Attribution data stored in cookies
export interface AttributionData {
  affiliateId: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
  firstTouchTimestamp: string;
  lastTouchTimestamp: string;
  conversions: number;
  totalValue: number;
}

// Cookie names
const ATTRIBUTION_COOKIE_NAME = "affiliate_attribution";
const CLICK_HISTORY_COOKIE_NAME = "affiliate_clicks";

/**
 * Get attribution cookie name with locale prefix
 */
export function getAttributionCookieName(locale?: string): string {
  return locale ? `${ATTRIBUTION_COOKIE_NAME}_${locale}` : ATTRIBUTION_COOKIE_NAME;
}

/**
 * Get click history cookie name with locale prefix
 */
export function getClickHistoryCookieName(locale?: string): string {
  return locale ? `${CLICK_HISTORY_COOKIE_NAME}_${locale}` : CLICK_HISTORY_COOKIE_NAME;
}

/**
 * Parse UTM parameters from URL
 */
export function parseUtmParams(url: string): Record<string, string | undefined> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string | undefined> = {};
    
    const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    
    utmParams.forEach(param => {
      params[param] = urlObj.searchParams.get(param) || undefined;
    });
    
    return params;
  } catch {
    return {};
  }
}

/**
 * Extract affiliate ID from URL
 * Supports formats like: ?ref=affiliate_id, ?affiliate=id, /ref/id
 */
export function extractAffiliateId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check for ref parameter
    const ref = urlObj.searchParams.get("ref");
    if (ref) return ref;
    
    // Check for affiliate parameter
    const affiliate = urlObj.searchParams.get("affiliate");
    if (affiliate) return affiliate;
    
    // Check for /ref/ path pattern
    const pathMatch = urlObj.pathname.match(/\/ref\/([^/?#]+)/);
    if (pathMatch) return pathMatch[1];
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Build affiliate URL with tracking parameters
 */
export function buildAffiliateUrl(
  baseUrl: string,
  options: {
    affiliateId: string;
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  }
): string {
  try {
    const urlObj = new URL(baseUrl);
    
    // Add affiliate reference
    urlObj.searchParams.set("ref", options.affiliateId);
    
    // Add UTM parameters
    if (options.source) urlObj.searchParams.set("utm_source", options.source);
    if (options.medium) urlObj.searchParams.set("utm_medium", options.medium);
    if (options.campaign) urlObj.searchParams.set("utm_campaign", options.campaign);
    if (options.content) urlObj.searchParams.set("utm_content", options.content);
    if (options.term) urlObj.searchParams.set("utm_term", options.term);
    
    return urlObj.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Store attribution data in cookie
 */
export function storeAttribution(
  data: AttributionData,
  config: AffiliateConfig = defaultAffiliateConfig,
  locale?: string
): void {
  if (typeof document === "undefined") return;
  
  const cookieName = getAttributionCookieName(locale);
  const expires = new Date();
  expires.setDate(expires.getDate() + config.cookieRetentionDays);
  
  document.cookie = `${cookieName}=${JSON.stringify(data)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get attribution data from cookie
 */
export function getAttribution(locale?: string): AttributionData | null {
  if (typeof document === "undefined") return null;
  
  const cookieName = getAttributionCookieName(locale);
  const cookies = document.cookie.split(";");
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName && value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Record affiliate click
 */
export function recordAffiliateClick(
  data: Omit<AffiliateClickData, "timestamp">,
  config: AffiliateConfig = defaultAffiliateConfig
): void {
  if (typeof document === "undefined") return;
  
  const clickData: AffiliateClickData = {
    ...data,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
  };
  
  // Update or create attribution data
  const existingAttribution = getAttribution();
  
  const attributionData: AttributionData = existingAttribution || {
    affiliateId: data.affiliateId,
    source: data.source || "direct",
    medium: data.medium || "referral",
    campaign: data.campaign || "",
    content: data.content,
    term: data.term,
    firstTouchTimestamp: clickData.timestamp,
    lastTouchTimestamp: clickData.timestamp,
    conversions: 0,
    totalValue: 0,
  };
  
  // Update attribution data
  attributionData.lastTouchTimestamp = clickData.timestamp;
  
  // Store the attribution
  storeAttribution(attributionData, config);
  
  // Send GA event
  sendGAEvent("affiliate_click", {
    tool_slug: data.toolSlug,
    tool_name: data.toolName,
    affiliate_id: data.affiliateId,
    source: data.source,
    medium: data.medium,
    campaign: data.campaign,
    location: data.pageUrl,
    position: data.position,
  });
  
  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[Affiliate Tracking] Click recorded:", clickData);
  }
}

/**
 * Record affiliate impression
 */
export function recordAffiliateImpression(
  toolSlug: string,
  toolName: string,
  affiliateId: string,
  position?: string
): void {
  if (typeof document === "undefined") return;
  
  sendGAEvent("affiliate_impression", {
    tool_slug: toolSlug,
    tool_name: toolName,
    affiliate_id: affiliateId,
    position,
  });
}

/**
 * Clear attribution data (for privacy compliance)
 */
export function clearAttribution(locale?: string): void {
  if (typeof document === "undefined") return;
  
  const cookieName = getAttributionCookieName(locale);
  document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  
  const historyCookieName = getClickHistoryCookieName(locale);
  document.cookie = `${historyCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Check if user has opted out of tracking
 */
export function hasTrackingOptOut(): boolean {
  if (typeof document === "undefined") return false;
  
  // Check for common opt-out cookies
  const optOutCookies = [
    "ga_optout",
    "ads_prefs",
    "marketing_optout",
    "DoNotSell",
  ];
  
  const cookies = document.cookie.split(";");
  
  for (const cookie of cookies) {
    const [name] = cookie.trim().split("=");
    if (optOutCookies.includes(name.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get attribution summary for display
 */
export function getAttributionSummary(): Record<string, string | number | null> | null {
  const attribution = getAttribution();
  
  if (!attribution) return null;
  
  const daysSinceFirst = Math.floor(
    (Date.now() - new Date(attribution.firstTouchTimestamp).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    affiliateId: attribution.affiliateId,
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    conversions: attribution.conversions,
    totalValue: attribution.totalValue,
    daysSinceFirstTouch: daysSinceFirst,
  };
}

/**
 * Update conversion data
 */
export function recordConversion(
  data: Omit<AffiliateConversionData, "timestamp">,
  config: AffiliateConfig = defaultAffiliateConfig
): void {
  if (typeof document === "undefined") return;
  
  // Check for opt-out
  if (hasTrackingOptOut()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Affiliate Tracking] Conversion not recorded - user opted out");
    }
    return;
  }
  
  const conversionData: AffiliateConversionData = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  
  // Update attribution data
  const attribution = getAttribution();
  if (attribution) {
    attribution.conversions += 1;
    if (data.value) {
      attribution.totalValue += data.value;
    }
    storeAttribution(attribution, config);
  }
  
  // Send GA event
  sendGAEvent("affiliate_conversion", {
    affiliate_id: data.affiliateId,
    tool_slug: data.toolSlug,
    conversion_type: data.conversionType,
    value: data.value,
    currency: data.currency || "USD",
    attribution_model: data.attributionModel,
  });
  
  if (process.env.NODE_ENV === "development") {
    console.log("[Affiliate Tracking] Conversion recorded:", conversionData);
  }
}
