import { NextRequest, NextResponse } from 'next/server';
import { appendSubscriber } from '@/lib/google-sheets';
import { securityCheck, checkFormSecurity, createRateLimitHeaders } from '@/lib/security';
import { getClientIP } from '@/lib/security/bot-detection';
import { trackRequest } from '@/lib/security/anomaly-detection';
import { logFormSubmission } from '@/lib/security/audit-log';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const path = request.nextUrl.pathname;

  try {
    // Security check
    const securityResult = await securityCheck(request);
    
    if (!securityResult.allowed) {
      if (securityResult.challenge === 'block') {
        return NextResponse.json(
          { error: 'Forbidden', message: securityResult.reason },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Verification Required', message: securityResult.reason, requiresCaptcha: true },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate email format
    if (!email || !email.includes('@')) {
      await trackRequest(ip, path, 'POST', 400, userAgent);
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Additional rate limit for subscriptions
    const submitKey = `subscribe:${ip}`;
    const { checkRateLimit } = await import('@/lib/security/rate-limiter');
    const { RATE_LIMITS } = await import('@/lib/security/rate-limit-config');
    const rateLimit = await checkRateLimit(
      submitKey,
      RATE_LIMITS.API.subscribe.requests,
      RATE_LIMITS.API.subscribe.windowSeconds
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts', message: 'Please try again later' },
        { status: 429 }
      );
    }

    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        await appendSubscriber(email);
      } else {
        console.warn('GOOGLE_SERVICE_ACCOUNT_JSON not set, skipping Google Sheets append.');
      }
      
      console.log(`[NEWSLETTER LEAD] New subscriber: ${email} at ${new Date().toISOString()}`);
      
      await trackRequest(ip, path, 'POST', 200, userAgent);
      await logFormSubmission(ip, path, 'newsletter_subscription', false, userAgent);

      return NextResponse.json(
        { message: 'Subscribed successfully' },
        { 
          status: 200,
          headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
        }
      );
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      await trackRequest(ip, path, 'POST', 500, userAgent);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    await trackRequest(ip, path, 'POST', 400, userAgent);
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}
