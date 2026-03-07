/**
 * Affiliate Tracking API Route
 * 
 * POST /api/affiliate/track
 * - Records affiliate link clicks
 * - Stores attribution data
 * - Implements referrer tracking
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { 
  recordClick, 
  initializeDemoData,
  getAffiliateBySlug 
} from "@/lib/affiliate/database";
import { parseReferrer, parseUserAgent, parseUtmParams, getOrCreateSessionId } from "@/lib/affiliate-tracking";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIP } from "@/lib/security/bot-detection";
import { ENDPOINT_CONFIGS } from "@/lib/security/rate-limit-config-v2";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check rate limit
    const config = ENDPOINT_CONFIGS['/api/affiliate/track'];
    const rateLimit = await checkRateLimit(
      `affiliate:track:${ip}`,
      config?.limit || 60,
      config?.windowSeconds || 60
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many tracking requests", message: "Please try again later" },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config?.limit || 60),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }
    
    // Initialize demo data if needed
    await initializeDemoData();
    
    const body = await request.json();
    
    const {
      toolSlug,
      toolName,
      affiliateId,
      affiliateSlug,
      source,
      medium,
      campaign,
      content,
      term,
      pageUrl,
      position,
    } = body;
    
    // Validate required fields
    if (!toolSlug || (!affiliateId && !affiliateSlug)) {
      return NextResponse.json(
        { error: "Missing required fields: toolSlug and (affiliateId or affiliateSlug)" },
        { status: 400 }
      );
    }
    
    // Resolve affiliate ID from slug if needed
    let resolvedAffiliateId = affiliateId;
    if (!resolvedAffiliateId && affiliateSlug) {
      const affiliate = await getAffiliateBySlug(affiliateSlug);
      if (affiliate) {
        resolvedAffiliateId = affiliate.id;
      }
    }

    if (!resolvedAffiliateId) {
      resolvedAffiliateId = toolSlug;
    }
    
    // Get referrer information
    const referrer = request.headers.get("referer") || undefined;
    const referrerInfo = parseReferrer(referrer);
    
    // Get user agent information
    const userAgent = request.headers.get("user-agent") || undefined;
    const userAgentInfo = parseUserAgent(userAgent);
    
    // Get UTM parameters from page URL
    const utmParams = parseUtmParams(pageUrl || request.url);
    
    // Get or create session ID
    const sessionId = getOrCreateSessionId();
    
    // Get IP hash for privacy-preserving identification
    const ipHeader = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const ipHash = ipHeader
      ? crypto.createHash("sha256").update(ipHeader).digest("hex").substring(0, 16)
      : undefined;
    
    // Record the click
    const click = await recordClick({
      affiliate_id: resolvedAffiliateId,
      tool_slug: toolSlug,
      tool_name: toolName,
      source: source || referrerInfo.referrerDomain || utmParams.utm_source || "direct",
      medium: medium || referrerInfo.referrerSocialPlatform || utmParams.utm_medium || "referral",
      campaign: campaign || utmParams.utm_campaign,
      content: content || utmParams.utm_content,
      term: term || utmParams.utm_term,
      referrer: referrerInfo.referrer,
      user_agent: userAgent,
      ip_hash: ipHash,
      referrer_domain: referrerInfo.referrerDomain,
      country: request.headers.get("x-country-code") || undefined,
      device_type: userAgentInfo.device as 'desktop' | 'mobile' | 'tablet' | undefined,
      browser: userAgentInfo.browser,
      page_url: pageUrl || request.url,
      position,
      session_id: sessionId,
      affiliate_name: toolName,
    });
    
    // Set attribution cookie
    const cookieStore = await cookies();
    const attributionCookie = JSON.stringify({
      affiliateId: resolvedAffiliateId,
      source: source || referrerInfo.referrerDomain || "direct",
      medium: medium || "referral",
      campaign: campaign || "",
      content,
      term,
      firstTouchTimestamp: click.click_timestamp,
      lastTouchTimestamp: click.click_timestamp,
      conversions: 0,
      totalValue: 0,
      sessionId,
      clickCount: 1,
    });
    
    cookieStore.set("affiliate_attribution", attributionCookie, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
      sameSite: "lax",
    });
    
    // Return success with click ID
    return NextResponse.json({
      success: true,
      clickId: click.id,
      timestamp: click.click_timestamp,
      sessionId,
      remaining: rateLimit.remaining,
    });
    
  } catch (error) {
    console.error("[Affiliate API] Error recording click:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get("affiliateId");
    
    // Return aggregated stats
    const { getOverviewMetrics, getAffiliateMetrics } = await import("@/lib/affiliate/database");
    
    if (affiliateId) {
      const metrics = await getAffiliateMetrics(affiliateId);
      return NextResponse.json({
        success: true,
        data: metrics,
      });
    } else {
      const overview = await getOverviewMetrics();
      return NextResponse.json({
        success: true,
        data: overview,
      });
    }
  } catch (error) {
    console.error("[Affiliate API] Error getting metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
