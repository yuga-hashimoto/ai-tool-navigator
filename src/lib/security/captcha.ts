import { Redis } from '@upstash/redis/cloudflare';
import { CLEANUP_INTERVALS } from './rate-limit-config';

let redis: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (redis) return redis;
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    return redis;
  }
  
  return null;
};

// CAPTCHA types
export type CaptchaType = 'simple' | 'math' | 'image' | 'turnstile';

// CAPTCHA challenge
export interface CaptchaChallenge {
  id: string;
  type: CaptchaType;
  question: string;
  answer: string; // For simple/math
  options?: string[]; // For multiple choice
  expiresAt: number;
  attempts: number;
}

// In-memory CAPTCHA store
const captchaStore: Map<string, CaptchaChallenge> = new Map();

// Generate a simple CAPTCHA
const generateSimpleCaptcha = (): CaptchaChallenge => {
  const id = generateRandomId();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return {
    id,
    type: 'simple',
    question: 'Enter the characters shown',
    answer: code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  };
};

// Generate a math CAPTCHA
const generateMathCaptcha = (): CaptchaChallenge => {
  const id = generateRandomId();
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const isAddition = Math.random() > 0.5;
  
  const question = isAddition 
    ? `What is ${a} + ${b}?` 
    : `What is ${a} + ${b}?`; // Keep it simple for now
  
  const answer = String(a + b);
  
  return {
    id,
    type: 'math',
    question,
    answer,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  };
};

// Generate random ID
const generateRandomId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate CAPTCHA
export const generateCaptcha = (type: CaptchaType = 'simple'): CaptchaChallenge => {
  switch (type) {
    case 'math':
      return generateMathCaptcha();
    case 'simple':
    default:
      return generateSimpleCaptcha();
  }
};

// Store CAPTCHA (Redis or memory)
export const storeCaptcha = async (challenge: CaptchaChallenge): Promise<string> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.set(`captcha:${challenge.id}`, challenge, { ex: 300 });
  } else {
    captchaStore.set(challenge.id, challenge);
  }
  
  return challenge.id;
};

// Get CAPTCHA
export const getCaptcha = async (id: string): Promise<CaptchaChallenge | null> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    const challenge = await redisClient.get<CaptchaChallenge>(`captcha:${id}`);
    return challenge || null;
  }
  
  return captchaStore.get(id) || null;
};

// Verify CAPTCHA
export const verifyCaptcha = async (
  id: string, 
  answer: string
): Promise<{ valid: boolean; challenge?: CaptchaChallenge }> => {
  const challenge = await getCaptcha(id);
  
  if (!challenge) {
    return { valid: false };
  }
  
  // Check expiration
  if (Date.now() > challenge.expiresAt) {
    await invalidateCaptcha(id);
    return { valid: false };
  }
  
  // Increment attempts
  challenge.attempts++;
  
  // Check max attempts
  if (challenge.attempts > 3) {
    await invalidateCaptcha(id);
    return { valid: false };
  }
  
  // Check answer (case-insensitive)
  const isValid = challenge.answer.toLowerCase() === answer.toLowerCase();
  
  if (isValid) {
    // Invalidate on success (one-time use)
    await invalidateCaptcha(id);
  }
  
  return { valid: isValid, challenge };
};

// Invalidate CAPTCHA
export const invalidateCaptcha = async (id: string): Promise<void> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.del(`captcha:${id}`);
  } else {
    captchaStore.delete(id);
  }
};

// Check if CAPTCHA is required for IP
export const requiresCaptcha = async (ip: string): Promise<boolean> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    const failedCount = await redisClient.get<number>(`captcha_required:${ip}`);
    return (failedCount || 0) >= 2;
  }
  
  return false;
};

// Record failed CAPTCHA attempt
export const recordFailedCaptcha = async (ip: string): Promise<void> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    const key = `captcha_required:${ip}`;
    const count = await redisClient.incr(key);
    await redisClient.expire(key, 3600); // 1 hour
  }
};

// Clear CAPTCHA requirement
export const clearCaptchaRequirement = async (ip: string): Promise<void> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.del(`captcha_required:${ip}`);
  }
};

// Turnstile (Cloudflare) integration helper
// Note: Requires CLOUDFLARE_TURNSTILE_SECRET_KEY in environment
export interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
}

export const verifyTurnstile = async (token: string, ip: string): Promise<TurnstileResult> => {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    // If no secret key configured, accept all (development mode)
    console.warn('Turnstile secret key not configured - skipping verification');
    return { success: true };
  }
  
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);
    
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    
    const outcome = await result.json() as {
      success: boolean;
      'error-codes'?: string[];
    };
    
    return {
      success: outcome.success,
      errorCodes: outcome['error-codes'],
    };
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return { success: false, errorCodes: ['verification_error'] };
  }
};
