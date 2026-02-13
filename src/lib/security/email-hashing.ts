import crypto from 'crypto';

/**
 * Secure email hashing utility
 * Hashes email addresses before storage for privacy compliance
 */

// Algorithm for hashing
const ALGORITHM = 'sha256';
const OUTPUT_ENCODING = 'hex';

/**
 * Hash an email address using SHA-256
 * Returns a consistent, one-way hash for storage
 * 
 * @param email - The email address to hash
 * @returns Hashed email string (hex encoded)
 */
export function hashEmail(email: string): string {
  if (!email) {
    throw new Error('Email is required for hashing');
  }

  // Normalize email (lowercase, trim) for consistent hashing
  const normalizedEmail = email.toLowerCase().trim();
  
  // Create hash
  const hash = crypto.createHash(ALGORITHM);
  hash.update(normalizedEmail);
  
  return hash.digest(OUTPUT_ENCODING);
}

/**
 * Hash email with salt for additional security
 * Useful for scenarios where rainbow table attacks are a concern
 * 
 * @param email - The email address to hash
 * @param salt - Optional salt value (uses env salt if not provided)
 * @returns Salted and hashed email string
 */
export function hashEmailWithSalt(email: string, salt?: string): string {
  if (!email) {
    throw new Error('Email is required for hashing');
  }

  const emailSalt = salt || process.env.EMAIL_HASH_SALT || 'default-salt';
  const normalizedEmail = email.toLowerCase().trim();
  
  // Create salted hash
  const hash = crypto.createHash(ALGORITHM);
  hash.update(normalizedEmail + emailSalt);
  
  return hash.digest(OUTPUT_ENCODING);
}

/**
 * Generate a unique identifier for deduplication
 * Combines hash with site-specific prefix
 * 
 * @param email - The email address
 * @returns Unique lead identifier
 */
export function generateLeadId(email: string): string {
  const hash = hashEmail(email);
  return `lead_${hash.substring(0, 16)}`;
}

/**
 * Validate email format before hashing
 * 
 * @param email - Email to validate
 * @returns boolean indicating if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create a truncated email for logging (privacy-safe)
 * Shows only first 2 chars and domain
 * 
 * @param email - Full email address
 * @returns Masked email for logging
 */
export function maskEmailForLogging(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***@***.***';
  
  const maskedLocal = localPart.substring(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}
