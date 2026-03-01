/**
 * Data Protection & Privacy
 * Handles PII detection and masking.
 * Safe for Edge Runtime.
 */

export interface PIIDetectionResult {
  detected: boolean;
  types: string[];
}

const PII_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  IP_ADDRESS: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
};

/**
 * Detect PII (Personally Identifiable Information) in content
 */
export const detectPII = (content: string): PIIDetectionResult => {
  const detectedTypes: string[] = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(content)) {
      detectedTypes.push(type);
    }
  }

  return {
    detected: detectedTypes.length > 0,
    types: detectedTypes,
  };
};

/**
 * Mask sensitive data in a string
 */
export const maskPII = (content: string): string => {
  let masked = content;

  masked = masked.replace(PII_PATTERNS.EMAIL, '[EMAIL]');
  masked = masked.replace(PII_PATTERNS.PHONE, '[PHONE]');
  masked = masked.replace(PII_PATTERNS.CREDIT_CARD, '[CREDIT_CARD]');
  masked = masked.replace(PII_PATTERNS.SSN, '[SSN]');

  return masked;
};
