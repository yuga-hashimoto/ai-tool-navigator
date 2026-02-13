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
} from './affiliate-tracking';

// URL utilities
export {
  buildAffiliateUrl,
  parseUtmParams,
  extractAffiliateId,
} from './affiliate-tracking';

// Types and interfaces
export type {
  AffiliateConfig,
  AffiliateEventType,
  AttributionModel,
  AffiliateClickData,
  AffiliateConversionData,
  AttributionData,
} from './affiliate-tracking';

// Configuration
export { defaultAffiliateConfig } from './affiliate-tracking';

// Cookie utilities
export {
  getAttributionCookieName,
  getClickHistoryCookieName,
} from './affiliate-tracking';
