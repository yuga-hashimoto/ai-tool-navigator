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
export * from './ip-reputation';

// Audit logging
export * from './audit-log';

// CAPTCHA (clearCaptchaRequirement is also in ip-reputation, export from there only)
export {
  type CaptchaType,
  type CaptchaChallenge,
  type TurnstileResult,
  generateCaptcha,
  storeCaptcha,
  getCaptcha,
  verifyCaptcha,
  invalidateCaptcha,
  requiresCaptcha,
  recordFailedCaptcha,
  verifyTurnstile,
} from './captcha';

// Anomaly detection
export * from './anomaly-detection';

// Honeypot - module temporarily disabled due to missing file
// export {
//   HoneypotField,
//   TimeHoneypot,
//   HoneyToken,
//   CombinedHoneypot,
//   validateHoneypot,
//   HONEYPOT_FIELD_NAMES
// } from './honeypot';

// Security middleware
export * from './security-middleware';
