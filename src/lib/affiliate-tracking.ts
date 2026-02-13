/**
 * Affiliate Tracking and Attribution Library
 * 
 * This module provides utilities for tracking affiliate link clicks,
 * referrer tracking, attribution management, and conversion tracking.
 * 
 * Privacy Compliance:
 * - GDPR: Minimizes personal data, provides opt-out mechanisms
 * - CCPA: California consumer privacy considerations
 * - Browser compatibility: Supports Safari ITP, Firefox ETP
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
  sessionTimeoutMinutes: number;
  referrerExcludedDomains: string[];
}

// Default configuration
export const defaultAffiliateConfig: AffiliateConfig = {
  campaignParam: "utm_campaign",
  sourceParam: "utm_source",
  mediumParam: "utm_medium",
  contentParam: "utm_content",
  termParam: "utm_term",
  cookieRetentionDays: 90, // 90 days for affiliate attribution window
  sessionTimeoutMinutes: 30, // Session timeout for tracking
  referrerExcludedDomains: [
    'localhost',
    '127.0.0.1',
    '',
  ],
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

// Enhanced click event data with referrer tracking
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
  referrerDomain?: string;
  referrerSearchTerm?: string;
  referrerSocialPlatform?: string;
  userAgent?: string;
  userAgentBrowser?: string;
  userAgentOS?: string;
  userAgentDevice?: string;
  pageUrl: string;
  position?: string;
  sessionId?: string;
  ipHash?: string;
  country?: string;
  language?: string;
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
  orderId?: string;
  couponCode?: string;
}

// Attribution data stored in cookies/localStorage
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
  sessionId: string;
  clickCount: number;
}

// Enhanced attribution with referrer data
export interface EnhancedAttributionData extends AttributionData {
  referrer?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

// Cookie names
const ATTRIBUTION_COOKIE_NAME = "affiliate_attribution";
const CLICK_HISTORY_COOKIE_NAME = "affiliate_clicks";
const SESSION_COOKIE_NAME = "affiliate_session";

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
 * Get session cookie name with locale prefix
 */
export function getSessionCookieName(locale?: string): string {
  return locale ? `${SESSION_COOKIE_NAME}_${locale}` : SESSION_COOKIE_NAME;
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
    
    // Check for aff parameter
    const aff = urlObj.searchParams.get("aff");
    if (aff) return aff;
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse and extract referrer information
 */
export function parseReferrer(referrer: string | undefined): {
  referrer: string | undefined;
  referrerDomain: string | undefined;
  referrerSocialPlatform: string | undefined;
  referrerSearchTerm: string | undefined;
} {
  if (!referrer) {
    return {
      referrer: undefined,
      referrerDomain: undefined,
      referrerSocialPlatform: undefined,
      referrerSearchTerm: undefined,
    };
  }
  
  try {
    const urlObj = new URL(referrer);
    const domain = urlObj.hostname.toLowerCase();
    
    // Detect social platform
    const socialPlatforms: Record<string, string[]> = {
      'twitter': ['twitter.com', 't.co', 'x.com'],
      'facebook': ['facebook.com', 'fb.me', 'fb.com'],
      'linkedin': ['linkedin.com', 'lnkd.in'],
      'instagram': ['instagram.com', 'instagr.am'],
      'youtube': ['youtube.com', 'youtu.be'],
      'pinterest': ['pinterest.com', 'pin.it'],
      'reddit': ['reddit.com', 'redd.it'],
      'tiktok': ['tiktok.com', 'tiktokapi.com'],
      'discord': ['discord.gg', 'discord.com'],
      'github': ['github.com', 'gh.io'],
    };
    
    let socialPlatform: string | undefined;
    for (const [platform, domains] of Object.entries(socialPlatforms)) {
      if (domains.some(d => domain.includes(d))) {
        socialPlatform = platform;
        break;
      }
    }
    
    // Extract search term if from search engine
    const searchEngines: Record<string, string[]> = {
      'google': ['google.com', 'google.co', 'google.jp'],
      'bing': ['bing.com', 'microsoft.com'],
      'yahoo': ['yahoo.com'],
      'duckduckgo': ['duckduckgo.com'],
      'baidu': ['baidu.com'],
      'yandex': ['yandex.ru'],
    };
    
    let searchTerm: string | undefined;
    for (const [engine, domains] of Object.entries(searchEngines)) {
      if (domains.some(d => domain.includes(d))) {
        const query = urlObj.searchParams.get('q');
        if (query) {
          searchTerm = query;
        }
        break;
      }
    }
    
    return {
      referrer,
      referrerDomain: domain,
      referrerSocialPlatform: socialPlatform,
      referrerSearchTerm: searchTerm,
    };
  } catch {
    return {
      referrer,
      referrerDomain: undefined,
      referrerSocialPlatform: undefined,
      referrerSearchTerm: undefined,
    };
  }
}

/**
 * Parse user agent for device/browser/OS information
 */
export function parseUserAgent(userAgent: string | undefined): {
  browser: string | undefined;
  os: string | undefined;
  device: string | undefined;
} {
  if (!userAgent) {
    return { browser: undefined, os: undefined, device: undefined };
  }
  
  const ua = userAgent.toLowerCase();
  
  // Detect browser
  let browser: string | undefined;
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome') && !ua.includes('chromium')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Detect OS
  let os: string | undefined;
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';
  
  // Detect device type
  let device: string | undefined;
  if (ua.includes('mobile') || ua.includes('android')) device = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'tablet';
  else device = 'desktop';
  
  return { browser, os, device };
}

/**
 * Generate or retrieve session ID
 */
export function getOrCreateSessionId(): string {
  if (typeof document === "undefined") return '';
  
  const cookieName = getSessionCookieName();
  const cookies = document.cookie.split(";");
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName && value) {
      return value;
    }
  }
  
  // Generate new session ID
  const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  // Store session ID
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + defaultAffiliateConfig.sessionTimeoutMinutes);
  document.cookie = `${cookieName}=${sessionId};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  return sessionId;
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
 * Record affiliate click with full referrer tracking
 */
export function recordAffiliateClick(
  data: Omit<AffiliateClickData, "timestamp">,
  config: AffiliateConfig = defaultAffiliateConfig
): void {
  if (typeof document === "undefined") return;
  
  // Parse referrer information
  const referrerInfo = parseReferrer(data.referrer);
  
  // Parse user agent
  const userAgentInfo = parseUserAgent(data.userAgent);
  
  // Get or create session ID
  const sessionId = getOrCreateSessionId();
  
  const clickData: AffiliateClickData = {
    ...data,
    ...referrerInfo,
    ...userAgentInfo,
    timestamp: new Date().toISOString(),
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    sessionId,
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
    sessionId,
    clickCount: 0,
  };
  
  // Update attribution data
  attributionData.lastTouchTimestamp = clickData.timestamp;
  attributionData.clickCount += 1;
  
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
    referrer_domain: referrerInfo.referrerDomain,
    social_platform: referrerInfo.referrerSocialPlatform,
    device: userAgentInfo.device,
    browser: userAgentInfo.browser,
    os: userAgentInfo.os,
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
  
  const sessionCookieName = getSessionCookieName(locale);
  document.cookie = `${sessionCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Check if user has opted out of tracking
 */
export function hasTrackingOptOut(): boolean {
  if (typeof document === "undefined") return false;
  
  // Check for common opt-out cookies
  const optOutCookies = [
    'ga_optout',
    'ads_prefs',
    'marketing_optout',
    'DoNotSell',
    'global_opt_out',
  ];
  
  const cookies = document.cookie.split(";");
  
  for (const cookie of cookies) {
    const [name] = cookie.trim().split("=");
    if (optOutCookies.includes(name.toLowerCase())) {
      return true;
    }
  }
  
  // Check for navigator.doNotTrack
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") {
    return true;
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
    clickCount: attribution.clickCount,
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
    order_id: data.orderId,
    coupon_code: data.couponCode,
  });
  
  if (process.env.NODE_ENV === "development") {
    console.log("[Affiliate Tracking] Conversion recorded:", conversionData);
  }
}

/**
 * Get referrer type classification
 */
export function getReferrerType(referrer: string | undefined): string {
  if (!referrer) return 'direct';
  
  try {
    const urlObj = new URL(referrer);
    const domain = urlObj.hostname.toLowerCase();
    
    // Social media
    const socialDomains = [
      'twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com',
      'pinterest.com', 'reddit.com', 'tiktok.com', 'youtube.com',
      'discord.gg', 'mastodon.social', 'threads.net',
    ];
    
    if (socialDomains.some(d => domain.includes(d))) {
      return 'social';
    }
    
    // Search engines
    const searchDomains = [
      'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
      'baidu.com', 'yandex.ru',
    ];
    
    if (searchDomains.some(d => domain.includes(d))) {
      return 'search';
    }
    
    // Email
    if (domain.includes('mail') || urlObj.protocol === 'mailto:') {
      return 'email';
    }
    
    // Other websites
    return 'referral';
  } catch {
    return 'unknown';
  }
}
