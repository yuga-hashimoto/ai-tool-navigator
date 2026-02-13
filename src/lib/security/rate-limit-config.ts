// Rate Limiting Configuration
// This file contains all configurable rate limits for the application

export const RATE_LIMITS = {
  // Global rate limits
  GLOBAL: {
    requests: 100,
    windowSeconds: 60, // 100 requests per minute globally
  },

  // Per-IP rate limits
  IP: {
    requests: 30,
    windowSeconds: 60, // 30 requests per minute per IP
    burst: 10, // Burst allowance
  },

  // Per-user rate limits (authenticated users)
  USER: {
    requests: 100,
    windowSeconds: 60, // 100 requests per minute per user
    daily: 1000, // 1000 requests per day
  },

  // API-specific rate limits
  API: {
    submit: {
      requests: 5,
      windowSeconds: 60, // 5 submissions per minute
      daily: 20, // 20 submissions per day
    },
    subscribe: {
      requests: 3,
      windowSeconds: 300, // 3 subscriptions per 5 minutes
      daily: 10,
    },
    subscriptionCheckout: {
      requests: 5,
      windowSeconds: 300, // 5 checkouts per 5 minutes
    },
    subscriptionStatus: {
      requests: 30,
      windowSeconds: 60, // 30 status checks per minute
    },
    subscriptionUpdate: {
      requests: 10,
      windowSeconds: 300, // 10 updates per 5 minutes
    },
    subscriptionPortal: {
      requests: 5,
      windowSeconds: 300, // 5 portal requests per 5 minutes
    },
    subscriptionPlans: {
      requests: 100,
      windowSeconds: 60, // 100 plan requests per minute (public data)
    },
  },

  // Admin API rate limits
  ADMIN: {
    subscriptionAnalytics: {
      requests: 30,
      windowSeconds: 60, // 30 analytics requests per minute
    },
  },

  // Authentication endpoints
  AUTH: {
    login: {
      requests: 5,
      windowSeconds: 300, // 5 attempts per 5 minutes
    },
    passwordReset: {
      requests: 3,
      windowSeconds: 3600, // 3 requests per hour
    },
  },

  // Critical actions
  CRITICAL: {
    requests: 10,
    windowSeconds: 300, // 10 critical actions per 5 minutes
  },
} as const;

export const BOT_SCORE_THRESHOLDS = {
  BLOCK: 0, // Completely block
  SUSPICIOUS: 30, // Require CAPTCHA
  SUSPECTED: 50, // Flag for review
  NORMAL: 80, // Normal traffic
} as const;

export const IP_REPUTATION = {
  BLOCK_THRESHOLD: -50, // Block IPs with score below this
  SUSPICIOUS_THRESHOLD: 0, // Flag IPs below this
  GOOD_THRESHOLD: 50, // Good reputation
  MAX_SCORE: 100,
  MIN_SCORE: -100,
} as const;

// Time windows for different cleanup operations
export const CLEANUP_INTERVALS = {
  RATE_LIMIT_WINDOW: 3600, // 1 hour
  BOT_SCORE_WINDOW: 86400, // 24 hours
  IP_REPUTATION_WINDOW: 604800, // 7 days
  AUDIT_LOG_RETENTION: 2592000, // 30 days
} as const;

// Honeypot field names (should be hidden from legitimate users)
export const HONEYPOT_FIELDS = [
  'website_url',
  'company_name',
  'fax_number',
] as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;
export type APIEndpoint = keyof typeof RATE_LIMITS.API;
