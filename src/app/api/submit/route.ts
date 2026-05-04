import { NextRequest, NextResponse } from 'next/server';
import { appendToolSubmission, ToolSubmissionData } from '@/lib/google-sheets';
import { securityCheck, checkFormSecurity, createRateLimitHeaders } from '@/lib/security';
// import { validateHoneypot, HONEYPOT_FIELDS } from '@/lib/security/honeypot';
import { logFormSubmission } from '@/lib/security/audit-log';
import { getClientIP } from '@/lib/security/bot-detection';
import { trackRequest } from '@/lib/security/anomaly-detection';
// import { setApiCompressionHeaders } from '@/lib/compression/headers';

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

    // Parse request body
    const body: ToolSubmissionData = await request.json();
    const { name, url, description, category, pricing_model, price } = body;

    // Validate honeypot (check form data manually since we're using JSON)
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value) formData.set(key, String(value));
    });
    
    // Honeypot validation temporarily disabled - module missing
    // const honeypotResult = validateHoneypot(formData, {
    //   websiteField: HONEYPOT_FIELDS.WEBSITE,
    //   companyField: HONEYPOT_FIELDS.COMPANY,
    //   tokenField: HONEYPOT_FIELDS.TOKEN,
    // });

    // Honeypot check temporarily disabled
    // if (!honeypotResult.isValid) {
    //   await logFormSubmission(ip, path, 'tool_submission', true, userAgent);
    //   // Silently accept to fool the bot
    //   return NextResponse.json(
    //     { message: 'Tool submitted successfully' },
    //     { status: 200 }
    //   );
    // }

    // Basic validation
    if (!name || !url || !description || !category || !pricing_model) {
      await trackRequest(ip, path, 'POST', 400, userAgent);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Additional security: Check form-specific rate limit
    const formSecurity = await checkFormSecurity(request, formData);
    if (!formSecurity.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions', message: formSecurity.reason },
        { status: 429 }
      );
    }

    try {
      try {
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
          await appendToolSubmission({ name, url, description, category, pricing_model, price: price || '' });
          console.log(`[TOOL SUBMISSION] New submission appended to Google Sheets: ${name} (${url}) at ${new Date().toISOString()}`);
        } else {
          console.warn('GOOGLE_SERVICE_ACCOUNT_JSON not set, skipping Google Sheets append.');
          console.log(`[TOOL SUBMISSION FALLBACK] New submission: ${name} (${url}) at ${new Date().toISOString()}`);
          console.log('Submission data:', { name, url, description, category, pricing_model, price });
        }
      } catch (sheetError) {
        console.warn('Google Sheets append failed, falling back to local logging:', sheetError);
        console.log(`[TOOL SUBMISSION FALLBACK] New submission: ${name} (${url}) at ${new Date().toISOString()}`);
        console.log('Submission data:', { name, url, description, category, pricing_model, price });
      }
      
      await trackRequest(ip, path, 'POST', 200, userAgent);
      await logFormSubmission(ip, path, 'tool_submission', false, userAgent);

      return NextResponse.json(
        { message: 'Tool submitted successfully' },
        { 
          status: 200,
          headers: createRateLimitHeaders(4, Date.now() + 60000),
        }
      );
    } catch (error) {
      console.error('Tool submission error:', error);
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
