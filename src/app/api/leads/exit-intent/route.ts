import { NextRequest, NextResponse } from "next/server";
import { securityCheck, createRateLimitHeaders } from "@/lib/security";
import { getClientIP } from "@/lib/security/bot-detection";
import { trackRequest } from "@/lib/security/anomaly-detection";
import { logFormSubmission } from "@/lib/security/audit-log";
import { appendSubscriber } from "@/lib/google-sheets";
import { hashEmail, generateLeadId } from "@/lib/security/email-hashing";
import crypto from "crypto";

// Lead storage interface
interface LeadRecord {
  lead_id: string;
  email_hash: string;
  original_email_hash: string;
  variant: string;
  source: string;
  geo_country: string;
  geo_offer_code: string | null;
  created_at: string;
  ip_hash: string;
  user_agent: string;
  converted: boolean;
  converted_at: string | null;
  experiment_id: string | null;
  session_id: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// In-memory storage for demo (use Redis/PostgreSQL in production)
const leadsStorage: Map<string, LeadRecord> = new Map();

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
        { error: "Forbidden", message: securityResult.reason },
        { status: 403 },
      );
    }

    // Check for admin API key
    const apiKey = request.headers.get("x-api-key");
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (!adminApiKey || apiKey !== adminApiKey) {
      await trackRequest(
        ip,
        path,
        "GET",
        401,
        request.headers.get("user-agent") || "",
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const variant = searchParams.get("variant");
    const geoCountry = searchParams.get("geo_country");
    const source = searchParams.get("source");
    const format = searchParams.get("format") || "json";

    // Convert leads map to array
    let filteredLeads = Array.from(leadsStorage.values());

    // Apply filters
    if (startDate) {
      const start = new Date(startDate);
      filteredLeads = filteredLeads.filter(
        (lead) => new Date(lead.created_at) >= start,
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLeads = filteredLeads.filter(
        (lead) => new Date(lead.created_at) <= end,
      );
    }

    if (variant) {
      filteredLeads = filteredLeads.filter((lead) => lead.variant === variant);
    }

    if (geoCountry) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.geo_country === geoCountry,
      );
    }

    if (source) {
      filteredLeads = filteredLeads.filter((lead) => lead.source === source);
    }

    // Calculate comprehensive analytics
    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(
      (lead) => lead.converted,
    ).length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Group by variant
    const leadsByVariant: Record<string, { total: number; converted: number }> =
      {};
    filteredLeads.forEach((lead) => {
      if (!leadsByVariant[lead.variant]) {
        leadsByVariant[lead.variant] = { total: 0, converted: 0 };
      }
      leadsByVariant[lead.variant].total++;
      if (lead.converted) {
        leadsByVariant[lead.variant].converted++;
      }
    });

    // Group by geo country
    const leadsByGeo: Record<string, { total: number; converted: number }> = {};
    filteredLeads.forEach((lead) => {
      const country = lead.geo_country || "unknown";
      if (!leadsByGeo[country]) {
        leadsByGeo[country] = { total: 0, converted: 0 };
      }
      leadsByGeo[country].total++;
      if (lead.converted) {
        leadsByGeo[country].converted++;
      }
    });

    // Group by source
    const leadsBySource: Record<string, { total: number; converted: number }> =
      {};
    filteredLeads.forEach((lead) => {
      if (!leadsBySource[lead.source]) {
        leadsBySource[lead.source] = { total: 0, converted: 0 };
      }
      leadsBySource[lead.source].total++;
      if (lead.converted) {
        leadsBySource[lead.source].converted++;
      }
    });

    // Calculate conversion rate by variant
    const variantConversionRates: Record<string, number> = {};
    Object.entries(leadsByVariant).forEach(([variantName, data]) => {
      variantConversionRates[variantName] =
        data.total > 0
          ? Math.round((data.converted / data.total) * 10000) / 100
          : 0;
    });

    // Calculate geo conversion rates
    const geoConversionRates: Record<string, number> = {};
    Object.entries(leadsByGeo).forEach(([country, data]) => {
      geoConversionRates[country] =
        data.total > 0
          ? Math.round((data.converted / data.total) * 10000) / 100
          : 0;
    });

    const analytics = {
      summary: {
        total_leads: totalLeads,
        converted_leads: convertedLeads,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        pending_leads: totalLeads - convertedLeads,
      },
      by_variant: leadsByVariant,
      variant_conversion_rates: variantConversionRates,
      by_geo: leadsByGeo,
      geo_conversion_rates: geoConversionRates,
      by_source: leadsBySource,
      period: {
        start: startDate || "all_time",
        end: endDate || new Date().toISOString(),
      },
    };

    // Return in requested format
    if (format === "csv") {
      const csv = generateCSV(filteredLeads);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="exit-intent-leads.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      analytics,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching lead analytics:", error);
    await trackRequest(
      ip,
      path,
      "GET",
      500,
      request.headers.get("user-agent") || "",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/leads/exit-intent
 * Save new exit intent lead
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;
  const referrer = request.headers.get("referer") || "";

  try {
    // Security check
    const securityResult = await securityCheck(request);

    if (!securityResult.allowed) {
      if (securityResult.challenge === "block") {
        return NextResponse.json(
          { error: "Forbidden", message: securityResult.reason },
          { status: 403 },
        );
      }
      return NextResponse.json(
        {
          error: "Verification Required",
          message: securityResult.reason,
          requiresCaptcha: true,
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      email,
      original_email_hash,
      variant = "default",
      source = "exit_intent_modal",
      geo_country = "unknown",
      geo_offer_code = null,
      experiment_id = null,
      session_id = null,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    // Validate required fields
    if (!email && !original_email_hash) {
      await trackRequest(ip, path, "POST", 400, userAgent);
      return NextResponse.json(
        { error: "Missing email or email hash" },
        { status: 400 },
      );
    }

    // Use provided hash or hash the email
    const emailHash =
      original_email_hash || (email ? await hashEmail(email) : "");

    if (!emailHash) {
      await trackRequest(ip, path, "POST", 400, userAgent);
      return NextResponse.json(
        { error: "Invalid email hash" },
        { status: 400 },
      );
    }

    // Rate limiting for lead submission
    const { checkRateLimit } = await import("@/lib/security/rate-limiter");
    const { RATE_LIMITS } = await import("@/lib/security/rate-limit-config");
    const rateLimitKey = `leads:${ip}`;
    const rateLimit = await checkRateLimit(
      rateLimitKey,
      RATE_LIMITS.API.subscribe.requests,
      RATE_LIMITS.API.subscribe.windowSeconds,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many submission attempts",
          message: "Please try again later",
        },
        {
          status: 429,
          headers: createRateLimitHeaders(
            rateLimit.remaining,
            rateLimit.resetTime,
          ),
        },
      );
    }

    // Check for duplicate leads (already subscribed)
    const existingLead = Array.from(leadsStorage.values()).find(
      (lead) => lead.email_hash === emailHash,
    );

    if (existingLead) {
      // Update if not already converted
      if (!existingLead.converted) {
        existingLead.converted = true;
        existingLead.converted_at = new Date().toISOString();
      }

      return NextResponse.json(
        {
          message: "Already subscribed",
          duplicate: true,
          lead_id: existingLead.lead_id,
          was_converted: existingLead.converted,
        },
        { status: 200 },
      );
    }

    // Create lead record
    const leadId = generateLeadId(emailHash || `${variant}${Date.now()}`);
    const leadRecord: LeadRecord = {
      lead_id: leadId,
      email_hash: emailHash,
      original_email_hash: emailHash,
      variant,
      source,
      geo_country,
      geo_offer_code,
      created_at: new Date().toISOString(),
      ip_hash: crypto
        .createHash("sha256")
        .update(ip)
        .digest("hex")
        .substring(0, 16),
      user_agent: userAgent.substring(0, 200),
      converted: true,
      converted_at: new Date().toISOString(),
      experiment_id,
      session_id: session_id || crypto.randomUUID().substring(0, 16),
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
    };

    // Store lead
    leadsStorage.set(leadId, leadRecord);

    // Add to Google Sheets if configured
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        await appendSubscriber(`lead_${leadId.substring(5)}`);
        console.log(
          `[EXIT INTENT LEAD] New lead appended to Google Sheets: lead_${leadId.substring(5)} at ${new Date().toISOString()}`,
        );
      } else {
        console.warn(
          "GOOGLE_SERVICE_ACCOUNT_JSON not set, skipping Google Sheets append.",
        );
        console.log(
          `[EXIT INTENT LEAD FALLBACK] New lead recorded locally: lead_${leadId.substring(5)}`,
        );
      }
    } catch (sheetsError) {
      const errorMsg =
        sheetsError instanceof Error
          ? sheetsError.message
          : String(sheetsError);
      if (
        errorMsg.includes("not configured") ||
        errorMsg.includes("is not set")
      ) {
        console.warn(
          `[EXIT INTENT LEAD FALLBACK] Google Sheets not configured. Lead recorded locally: lead_${leadId.substring(5)}`,
        );
      } else {
        console.warn(
          "Google Sheets append failed, falling back to local logging:",
          sheetsError,
        );
        console.log(
          `[EXIT INTENT LEAD FALLBACK] New lead recorded locally: lead_${leadId.substring(5)}`,
        );
      }
    }

    // Log the submission details
    console.log(`[EXIT INTENT LEAD] New lead captured details:
      Lead ID: ${leadId}
      Variant: ${variant}
      Source: ${source}
      Geo: ${geo_country}
      Offer Code: ${geo_offer_code || "none"}
      Experiment: ${experiment_id || "none"}
      Time: ${leadRecord.created_at}
    `);

    await trackRequest(ip, path, "POST", 200, userAgent);
    await logFormSubmission(ip, path, "exit_intent_lead", false, userAgent);

    return NextResponse.json(
      {
        success: true,
        message: "Lead captured successfully",
        lead_id: leadId,
        conversion_rate: calculateCurrentConversionRate(),
      },
      {
        status: 200,
        headers: createRateLimitHeaders(
          rateLimit.remaining,
          rateLimit.resetTime,
        ),
      },
    );
  } catch (error) {
    console.error("Error processing exit intent lead:", error);
    await trackRequest(ip, path, "POST", 400, userAgent);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}

/**
 * PATCH /api/leads/exit-intent
 * Update lead conversion status
 */
export async function PATCH(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;

  try {
    // Security check
    const securityResult = await securityCheck(request);
    if (!securityResult.allowed) {
      return NextResponse.json(
        { error: "Forbidden", message: securityResult.reason },
        { status: 403 },
      );
    }

    // Check for admin API key
    const apiKey = request.headers.get("x-api-key");
    const adminApiKey = process.env.ADMIN_API_KEY;

    if (!adminApiKey || apiKey !== adminApiKey) {
      await trackRequest(
        ip,
        path,
        "PATCH",
        401,
        request.headers.get("user-agent") || "",
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lead_id, converted = true } = body;

    if (!lead_id) {
      return NextResponse.json({ error: "Missing lead_id" }, { status: 400 });
    }

    const lead = leadsStorage.get(lead_id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    lead.converted = converted;
    lead.converted_at = converted ? new Date().toISOString() : null;

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead: {
        lead_id: lead.lead_id,
        converted: lead.converted,
        converted_at: lead.converted_at,
      },
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Calculate current conversion rate from storage
 */
function calculateCurrentConversionRate(): number {
  const leads = Array.from(leadsStorage.values());
  if (leads.length === 0) return 0;

  const converted = leads.filter((l) => l.converted).length;
  return Math.round((converted / leads.length) * 10000) / 100;
}

/**
 * Generate CSV from leads array
 */
function generateCSV(leads: LeadRecord[]): string {
  const headers = [
    "lead_id",
    "email_hash",
    "variant",
    "source",
    "geo_country",
    "geo_offer_code",
    "created_at",
    "converted",
    "converted_at",
    "experiment_id",
    "session_id",
    "referrer",
  ];

  const rows = leads.map((lead) => [
    lead.lead_id,
    lead.email_hash,
    lead.variant,
    lead.source,
    lead.geo_country,
    lead.geo_offer_code || "",
    lead.created_at,
    lead.converted.toString(),
    lead.converted_at || "",
    lead.experiment_id || "",
    lead.session_id,
    lead.referrer,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
