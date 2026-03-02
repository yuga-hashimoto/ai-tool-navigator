/**
 * Affiliate Tracking Module
 * 
 * This module provides utilities for affiliate link tracking,
 * attribution management, and conversion tracking.
 * 
 * @module affiliate-tracking
 */

// Core tracking functions
export {
  recordAffiliateClick,
  recordAffiliateImpression,
  recordConversion,
  storeAttribution,
  getAttribution,
  clearAttribution,
  hasTrackingOptOut,
  getAttributionSummary,
  buildAffiliateUrl,
  parseUtmParams,
  extractAffiliateId,
  defaultAffiliateConfig,
  getAttributionCookieName,
  getClickHistoryCookieName,
} from '../affiliate-tracking';

export type {
  AffiliateConfig,
  AffiliateEventType,
  AttributionModel,
  AffiliateClickData,
  AffiliateConversionData,
  AttributionData,
} from '../affiliate-tracking';
