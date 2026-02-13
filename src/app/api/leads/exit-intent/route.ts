import { NextRequest, NextResponse } from 'next/server';
import { securityCheck, createRateLimitHeaders } from '@/lib/security';
import { getClientIP } from '@/lib/security/bot-detection';
import { trackRequest } from '@/lib/security/anomaly-detection';
import { logFormSubmission } from '@/lib/security/audit-log';
import { appendSubscriber } from '@/lib/google-sheets';
import { hashEmail, isValidEmail, generateLeadId } from '@/lib/security/email-hashing';
import crypto from 'crypto';

// Lead storage interface
interface LeadRecord {
  lead_id: string;
  email_hash: string;
  variant: string;
  source: string;
  created_at: string;
  ip_hash?: string;
  user_agent?: string;
  converted: boolean;
}

// In-memory storage for demo (use database in production)
const leadsStorage: LeadRecord[] = [];

/**
 * GET /api/leads/exit-intent
 * Retrieve lead analytics data (admin only)
 */
export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;

  try {
    // Security check
    const securityResult = await securityCheck(request);
    if (!securityResult.allowed) {
      return NextResponse.json(
        { error: 'Forbidden', message: securityResult.reason },
        { status: 403 }
      );
    }

    // Check for admin API key
    const apiKey = request.headers.get('x-api-key');
    const adminApiKey = process.env.ADMIN_API_KEY;
    
    if (!adminApiKey || apiKey !== adminApiKey) {
      await trackRequest(ip, path, 'GET', 401, request.headers.get('user-agent') || '');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const variant = searchParams.get('variant');

    // Filter leads based on query params
    let filteredLeads = [...leadsStorage];

    if (startDate) {
      const start = new Date(startDate);
      filteredLeads = filteredLeads.filter(lead => new Date(lead.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLeads = filteredLeads.filter(lead => new Date(lead.created_at) <= end);
    }

    if (variant) {
      filteredLeads = filteredLeads.filter(lead => lead.variant === variant);
    }

    // Calculate analytics
    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(lead => lead.converted).length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Group by variant
    const leadsByVariant: Record<string, { total: number; converted: number }> = {};
    filteredLeads.forEach(lead => {
      if (!leadsByVariant[lead.variant]) {
        leadsByVariant[lead.variant] = { total: 0, converted: 0 };
      }
      leadsByVariant[lead.variant].total++;
      if (lead.converted) {
        leadsByVariant[lead.variant].converted++;
      }
    });

    // Calculate conversion rate by variant
    const variantConversionRates: Record<string, number> = {};
    Object.entries(leadsByVariant).forEach(([variant, data]) => {
      variantConversionRates[variant] = data.total > 0 ? (data.converted / data.total) * 100 : 0;
    });

    return NextResponse.json({
      success: true,
      analytics: {
        total_leads: totalLeads,
        converted_leads: convertedLeads,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        leads_by_variant: leadsByVariant,
        variant_conversion_rates: variantConversionRates,
        period: {
          start: startDate || 'all_time',
          end: endDate || 'now',
        },
      },
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    await trackRequest(ip, path, 'GET', 500, request.headers.get('user-agent') || '');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads/exit-intent
 * Save new exit intent lead
 */
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
    const { email, original_email_hash, variant = 'default', source = 'exit_intent_modal' } = body;

    // Validate required fields
    if (!email && !original_email_hash) {
      await trackRequest(ip, path, 'POST', 400, userAgent);
      return NextResponse.json(
        { error: 'Missing email or email hash' },
        { status: 400 }
      );
    }

    // Use provided hash or hash the email
    const emailHash = original_email_hash || (email ? hashEmail(email) : '');
    
    if (!emailHash) {
      await trackRequest(ip, path, 'POST', 400, userAgent);
      return NextResponse.json(
        { error: 'Invalid email hash' },
        { status: 400 }
      );
    }

    // Rate limiting for lead submission
    const { checkRateLimit } = await import('@/lib/security/rate-limiter');
    const { RATE_LIMITS } = await import('@/lib/security/rate-limit-config');
    const rateLimitKey = `leads:${ip}`;
    const rateLimit = await checkRateLimit(
      rateLimitKey,
      RATE_LIMITS.API.subscribe.requests,
      RATE_LIMITS.API.subscribe.windowSeconds
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submission attempts', message: 'Please try again later' },
        { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime) }
      );
    }

    // Check for duplicate leads (already subscribed)
    const existingLead = leadsStorage.find(lead => lead.email_hash === emailHash);
    if (existingLead) {
      return NextResponse.json(
        { 
          message: 'Already subscribed',
          duplicate: true,
          lead_id: existingLead.lead_id,
        },
        { status: 200 }
      );
    }

    // Create lead record
    const leadId = generateLeadId(emailHash || `${variant}${Date.now()}`);
    const leadRecord: LeadRecord = {
      lead_id: leadId,
      email_hash: emailHash,
      variant,
      source,
      created_at: new Date().toISOString(),
      ip_hash: crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16),
      user_agent: userAgent.substring(0, 200),
      converted: false,
    };

    // Store lead
    leadsStorage.push(leadRecord);

    // Add to Google Sheets if configured
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        await appendSubscriber(`lead_${leadId.substring(5)}`);
      }
    } catch (sheetsError) {
      console.error('Failed to append to Google Sheets:', sheetsError);
    }

    // Log the submission
    console.log(`[EXIT INTENT LEAD] New lead captured:
      Lead ID: ${leadId}
      Variant: ${variant}
      Source: ${source}
      Time: ${leadRecord.created_at}
    `);

    await trackRequest(ip, path, 'POST', 200, userAgent);
    await logFormSubmission(ip, path, 'exit_intent_lead', false, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        lead_id: leadId,
      },
      {
        status: 200,
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );
  } catch (error) {
    console.error('Error processing exit intent lead:', error);
    await trackRequest(ip, path, 'POST', 400, userAgent);
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}
