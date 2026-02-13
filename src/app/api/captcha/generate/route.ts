import { NextRequest, NextResponse } from 'next/server';
import { generateCaptcha, storeCaptcha, CaptchaChallenge } from '@/lib/security/captcha';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { getClientIP } from '@/lib/security/bot-detection';
import { ENDPOINT_CONFIGS } from '@/lib/security/rate-limit-config-v2';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    const body = await request.json();
    const type = body.type || 'math';
    
    // Check rate limit
    const config = ENDPOINT_CONFIGS['/api/captcha/generate'];
    const rateLimit = await checkRateLimit(
      `captcha:generate:${ip}`,
      config?.limit || 10,
      config?.windowSeconds || 60
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many CAPTCHA generation requests', message: 'Please try again later' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config?.limit || 10),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }
    
    // Generate new CAPTCHA
    const challenge = generateCaptcha(type);
    
    // Store it
    await storeCaptcha(challenge);
    
    // Return challenge (without the answer)
    return NextResponse.json({
      id: challenge.id,
      type: challenge.type,
      question: challenge.question,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CAPTCHA' },
      { status: 500 }
    );
  }
}
