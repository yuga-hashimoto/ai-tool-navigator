// Security module exports

// Configuration
export * from './rate-limit-config';

// Rate limiting
export * from './rate-limiter';
// export * from './rate-limit-middleware'; // Removed missing module
export * from './rate-limit-config-v2';

// Bot detection
export * from './bot-detection';

// IP reputation
// Exclude conflicting clearCaptchaRequirement from ip-reputation re-export
export {
  getIPReputation,
  updateIPReputation,
  blockIP,
  unblockIP,
  isIPBlockedFunc,
  getBlockedIPs,
  recordSuccess,
  recordFailure,
  type IPReputationResult
} from './ip-reputation';

// Audit logging
export * from './audit-log';

// CAPTCHA
// Explicitly re-export clearCaptchaRequirement from captcha
export * from './captcha';

// Anomaly detection
export * from './anomaly-detection';

// Honeypot
// Export HONEYPOT_FIELD_NAMES explicitly if it's not exported by default
export * from './honeypot';

// Security middleware
export * from './security-middleware';
