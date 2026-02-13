import { NextRequest } from 'next/server';
import { 
  BOT_SCORE_THRESHOLDS, 
  IP_REPUTATION,
  HONEYPOT_FIELDS 
} from './rate-limit-config';

// Bot detection patterns
const BOT_PATTERNS = {
  // Known bot user agents
  BOT_USER_AGENTS: [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
    'go-http', 'java/', 'ruby', 'perl', 'php', 'httpclient', 'aiohttp',
    'httpx', 'requests', 'urllib', 'fetch', 'googlebot', 'bingbot',
    'yandex', 'duckduckbot', 'facebookexternalhit', 'twitterbot',
    'linkedinbot', 'slurp', 'applebot', 'semrush', 'ahrefs', 'mj12bot',
    'dotbot', 'rogerbot', 'screaming frog', 'sitebulb', 'lighthouse',
    'puppeteer', 'playwright', 'selenium', 'chromedriver', 'firefoxdriver',
  ],
  
  // Suspicious headers
  SUSPICIOUS_HEADERS: [
    'x-iranian', 'x-axe7', 'x-evil', 'x-hacker', 'x-khujand', 'x-telegram',
  ],
  
  // Missing expected headers
  REQUIRED_HEADERS: [
    'user-agent', 'accept', 'accept-language',
  ],
};

// Calculate bot score based on request characteristics
export interface BotDetectionResult {
  score: number; // 0-100 (0 = definitely bot, 100 = definitely human)
  isBot: boolean;
  isSuspicious: boolean;
  requiresCaptcha: boolean;
  reasons: string[];
  flags: string[];
}

export const detectBot = (request: NextRequest): BotDetectionResult => {
  const userAgent = request.headers.get('user-agent') || '';
  const reasons: string[] = [];
  const flags: string[] = [];
  let score = 100;

  // Check User-Agent
  const uaCheck = checkUserAgent(userAgent);
  score -= uaCheck.score;
  if (uaCheck.reason) reasons.push(uaCheck.reason);
  flags.push(...uaCheck.flags);

  // Check for missing or suspicious headers
  const headerCheck = checkHeaders(request.headers);
  score -= headerCheck.score;
  if (headerCheck.reason) reasons.push(headerCheck.reason);
  flags.push(...headerCheck.flags);

  // Check request behavior patterns
  const behaviorCheck = checkBehavior(request);
  score -= behaviorCheck.score;
  if (behaviorCheck.reason) reasons.push(behaviorCheck.reason);
  flags.push(...behaviorCheck.flags);

  // Check for honeypot field submission
  const honeypotCheck = checkHoneypot(request);
  if (honeypotCheck.triggered) {
    score = 0;
    reasons.push('Honeypot field filled');
    flags.push('honeypot');
  }

  // Check for missing referer on POST requests
  const referer = request.headers.get('referer');
  if (request.method === 'POST' && !referer) {
    score -= 10;
    reasons.push('Missing referer on POST request');
    flags.push('missing-referer');
  }

  // Check Accept header
  const accept = request.headers.get('accept');
  if (!accept || !accept.includes('text/html')) {
    score -= 15;
    reasons.push('Invalid Accept header');
    flags.push('invalid-accept');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  const isBot = score < BOT_SCORE_THRESHOLDS.SUSPICIOUS;
  const isSuspicious = score < BOT_SCORE_THRESHOLDS.SUSPECTED;
  const requiresCaptcha = score < BOT_SCORE_THRESHOLDS.SUSPICIOUS;

  return {
    score,
    isBot,
    isSuspicious,
    requiresCaptcha,
    reasons,
    flags,
  };
};

// Check User-Agent string
const checkUserAgent = (userAgent: string) => {
  const result = { score: 0, reason: '', flags: [] as string[] };
  const ua = userAgent.toLowerCase();

  if (!userAgent) {
    result.score = 50;
    result.reason = 'Missing User-Agent header';
    result.flags.push('no-user-agent');
    return result;
  }

  // Check for known bot patterns
  for (const pattern of BOT_PATTERNS.BOT_USER_AGENTS) {
    if (ua.includes(pattern)) {
      result.score = 80;
      result.reason = `Known bot pattern detected: ${pattern}`;
      result.flags.push('known-bot');
      return result;
    }
  }

  // Check for suspicious patterns
  if (/^\s*$/i.test(userAgent)) {
    result.score = 30;
    result.reason = 'Empty User-Agent';
    result.flags.push('empty-user-agent');
  }

  // Check for very long user agents (often bots)
  if (userAgent.length > 500) {
    result.score = 20;
    result.reason = 'Unusually long User-Agent';
    result.flags.push('long-user-agent');
  }

  return result;
};

// Check headers for suspicious patterns
const checkHeaders = (headers: Headers) => {
  const result = { score: 0, reason: '', flags: [] as string[] };

  // Check for suspicious headers
  for (const header of BOT_PATTERNS.SUSPICIOUS_HEADERS) {
    if (headers.get(header)) {
      result.score = 100;
      result.reason = `Suspicious header detected: ${header}`;
      result.flags.push('suspicious-header');
      return result;
    }
  }

  // Check for missing required headers
  const missingHeaders: string[] = [];
  for (const header of BOT_PATTERNS.REQUIRED_HEADERS) {
    if (!headers.get(header)) {
      missingHeaders.push(header);
    }
  }

  if (missingHeaders.length >= 2) {
    result.score = 30;
    result.reason = `Missing required headers: ${missingHeaders.join(', ')}`;
    result.flags.push('missing-headers');
  }

  return result;
};

// Check for bot-like behavior
const checkBehavior = (request: NextRequest) => {
  const result = { score: 0, reason: '', flags: [] as string[] };

  // Check for automated request patterns via headers
  const headerSeq = request.headers.get('x-sequence') || request.headers.get('x-request-id');
  const headerTime = request.headers.get('x-timestamp');
  
  // If request has timing headers suggesting automation
  if (headerSeq && headerTime) {
    const seq = parseInt(headerSeq);
    const time = parseInt(headerTime);
    const now = Date.now();
    
    if (Math.abs(time - now) > 60000) { // More than 1 minute off
      result.score += 20;
      result.flags.push('suspicious-timing');
    }
  }

  // Check for common bot paths
  const path = request.nextUrl.pathname;
  const botPaths = ['/wp-admin', '/wp-login', '/phpinfo', '/.env', '/admin', '/xmlrpc.php'];
  
  for (const botPath of botPaths) {
    if (path.includes(botPath)) {
      result.score += 30;
      result.reason = `Access to bot-targeted path: ${botPath}`;
      result.flags.push('bot-path');
    }
  }

  return result;
};

// Check honeypot fields
const checkHoneypot = (request: NextRequest): { triggered: boolean } => {
  // For GET requests, check query params
  const url = request.nextUrl;
  
  for (const field of HONEYPOT_FIELDS) {
    if (url.searchParams.get(field)) {
      return { triggered: true };
    }
  }

  // For POST requests, would need to check body (handled separately)
  return { triggered: false };
};

// Check honeypot in form data
export const checkHoneypotFormData = (formData: FormData): boolean => {
  for (const field of HONEYPOT_FIELDS) {
    const value = formData.get(field);
    if (value && typeof value === 'string' && value.length > 0) {
      return true;
    }
  }
  return false;
};

// Get client IP from request
export const getClientIP = (request: NextRequest): string => {
  // Check for forwarded headers (reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
};

// Get client IP from request (non-NextRequest version)
export const getClientIPFromHeaders = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
};
