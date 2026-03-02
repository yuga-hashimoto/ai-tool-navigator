// Security module exports

// Configuration
export * from './rate-limit-config';

// Rate limiting
export * from './rate-limiter';
// export * from './rate-limit-middleware'; // Removed missing module
export * from './rate-limit-config-v2';

// Bot detection
export {
  detectBot,
  getClientIP,
  checkHoneypotFormData,
  getClientIPFromHeaders,
  type BotDetectionResult
} from './bot-detection';

// IP reputation
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
export {
  createAuditLog,
  queryAuditLogs,
  getSecurityStats,
  getSecurityStatsByPeriod,
  logRateLimitEvent,
  logBotDetection,
  logFormSubmission,
  AUDIT_EVENTS,
  type AuditLogEntry
} from './audit-log';

<<<<<<< HEAD
// CAPTCHA
export {
=======
// CAPTCHA (clearCaptchaRequirement is also in ip-reputation, export from there only)
export {
  type CaptchaType,
  type CaptchaChallenge,
  type TurnstileResult,
>>>>>>> origin/main
  generateCaptcha,
  storeCaptcha,
  getCaptcha,
  verifyCaptcha,
  invalidateCaptcha,
  requiresCaptcha,
  recordFailedCaptcha,
<<<<<<< HEAD
  clearCaptchaRequirement,
  verifyTurnstile,
  type CaptchaChallenge,
  type CaptchaType,
  type TurnstileResult
=======
  verifyTurnstile,
>>>>>>> origin/main
} from './captcha';

// Anomaly detection
export {
  trackRequest,
  detectAnomalies,
  getAnomalyScore,
  shouldBlockForAnomaly,
  type AnomalyResult,
  type AnomalyType
} from './anomaly-detection';

<<<<<<< HEAD
// Honeypot
export {
  HoneypotField,
  TimeHoneypot,
  HoneyToken,
  CombinedHoneypot,
  validateHoneypot,
  HONEYPOT_FIELDS
} from './honeypot';
=======
// Honeypot - module temporarily disabled due to missing file
// export {
//   HoneypotField,
//   TimeHoneypot,
//   HoneyToken,
//   CombinedHoneypot,
//   validateHoneypot,
//   HONEYPOT_FIELD_NAMES
// } from './honeypot';
>>>>>>> origin/main

// Security middleware
export * from './security-middleware';

// IDS
export {
  scanString,
  scanObject,
  detectIntrusion,
  type IDSResult
} from './ids';

// Malware scanner
export {
  scanContentForMalware,
  type MalwareScanResult
} from './malware-scanner';

// Vulnerability scanner
export {
  runVulnerabilityScan,
  type VulnerabilityResult
} from './vulnerability-scanner';

// Data protection
export {
  detectPII,
  maskPII,
  type PIIDetectionResult
} from './data-protection';
// export * from './data-encryption'; // Node-only, import directly where needed

// Compliance
export {
  getComplianceStatus,
  type ComplianceStatus,
  type ComplianceCheck
} from './compliance';

// Access control
export {
  hasPermission,
  getRolePermissions,
  isRoleHigher,
  type Role,
  type Permission
} from './access-control';

// Incident response
export {
  handleThreat,
  escalateIncident,
  type Incident
} from './incident-response';
