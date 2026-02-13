import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limiter';
import { detectBot, getClientIP, checkHoneypotFormData } from './bot-detection';
import { getIPReputation, recordSuccess, recordFailure, blockIP } from './ip-reputation';
import { createAuditLog, AUDIT_EVENTS, logRateLimitEvent, logBotDetection } from './audit-log';
import { RATE_LIMITS } from './rate-limit-config';

// Security check result
export interface SecurityCheckResult {
  allowed: boolean;
  challenge?: 'captcha' | 'block';
  reason?: string;
  botScore?: number;
  reputationScore?: number;
}

// Main security check function
export const securityCheck = async (request: NextRequest): Promise<SecurityCheckResult> => {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;
  const method = request.method;

  // 1. Check IP reputation first (fastest check)
  const reputation = await getIPReputation(ip);
  
  if (reputation.isBlocked) {
    await createAuditLog({
      eventType: AUDIT_EVENTS.IP_BLOCKED,
      ip,
      userAgent,
      path,
      method,
      status: 'blocked',
      reputationScore: reputation.score,
      reasons: reputation.reasons,
    });
    
    return {
      allowed: false,
      challenge: 'block',
      reason: 'IP is blocked due to suspicious activity',
      reputationScore: reputation.score,
    };
  }

  // 2. Check rate limit
  const rateLimitKey = `global:${ip}`;
  const rateLimit = await checkRateLimit(
    rateLimitKey,
    RATE_LIMITS.IP.requests,
    RATE_LIMITS.IP.windowSeconds
  );

  if (!rateLimit.allowed) {
    await recordFailure(ip, 'Rate limit exceeded');
    await logRateLimitEvent(ip, path, method, false, userAgent);
    
    // If rate limit exceeded multiple times, consider blocking
    if (rateLimit.totalHits > RATE_LIMITS.IP.requests * 2) {
      await blockIP(ip, 'Excessive rate limit violations');
    }
    
    return {
      allowed: false,
      challenge: 'block',
      reason: 'Rate limit exceeded. Please try again later.',
    };
  }

  // 3. Check bot detection
  const botResult = detectBot(request);
  
  if (botResult.isBot) {
    await recordFailure(ip, 'Bot detected');
    await logBotDetection(ip, path, method, botResult, userAgent);
    
    // Check if this is a severe bot
    if (botResult.score === 0) {
      await blockIP(ip, `Severe bot detected: ${botResult.flags.join(', ')}`);
    }
    
    return {
      allowed: false,
      challenge: 'block',
      reason: 'Automated request detected',
      botScore: botResult.score,
    };
  }

  // 4. Check if CAPTCHA is required based on suspicion
  if (botResult.requiresCaptcha || reputation.requiresCaptcha) {
    return {
      allowed: false,
      challenge: 'captcha',
      reason: 'Verification required',
      botScore: botResult.score,
      reputationScore: reputation.score,
    };
  }

  // 5. Log successful request
  await recordSuccess(ip);
  await logRateLimitEvent(ip, path, method, true, userAgent);

  return {
    allowed: true,
    botScore: botResult.score,
    reputationScore: reputation.score,
  };
};

// Middleware for API routes
export const withSecurity = async (
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> => {
  const securityResult = await securityCheck(request);

  if (!securityResult.allowed) {
    if (securityResult.challenge === 'block') {
      return NextResponse.json(
        { 
          error: 'Forbidden', 
          message: securityResult.reason,
          retryAfter: 60,
        },
        { 
          status: 403,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limited': 'true',
          },
        }
      );
    }

    // CAPTCHA required
    return NextResponse.json(
      { 
        error: 'Verification Required', 
        message: securityResult.reason,
        requiresCaptcha: true,
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limited': 'true',
        },
      }
    );
  }

  // Add security headers
  const response = await handler(request);
  
  response.headers.set('X-Bot-Score', String(securityResult.botScore || 0));
  response.headers.set('X-IP-Reputation', String(securityResult.reputationScore || 0));
  
  return response;
};

// Special handler for form submissions with honeypot
export const checkFormSecurity = async (
  request: NextRequest,
  formData: FormData
): Promise<SecurityCheckResult> => {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;

  // Check honeypot
  const honeypotTriggered = checkHoneypotFormData(formData);
  
  if (honeypotTriggered) {
    await createAuditLog({
      eventType: AUDIT_EVENTS.HONEYPOT_TRIGGERED,
      ip,
      userAgent,
      path,
      method: 'POST',
      status: 'blocked',
    });
    
    return {
      allowed: false,
      challenge: 'block',
      reason: 'Form submission blocked',
    };
  }

  // Check rate limit for submissions
  const submitKey = `submit:${ip}`;
  const rateLimit = await checkRateLimit(
    submitKey,
    RATE_LIMITS.API.submit.requests,
    RATE_LIMITS.API.submit.windowSeconds
  );

  if (!rateLimit.allowed) {
    await recordFailure(ip, 'Submission rate limit exceeded');
    return {
      allowed: false,
      challenge: 'block',
      reason: 'Too many submissions. Please try again later.',
    };
  }

  return { allowed: true };
};

// Create rate limit response headers
export const createRateLimitHeaders = (
  remaining: number,
  resetTime: number
): Record<string, string> => {
  const now = Date.now();
  const reset = Math.ceil((resetTime - now) / 1000);
  
  return {
    'X-RateLimit-Limit': String(RATE_LIMITS.IP.requests),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(reset),
  };
};
