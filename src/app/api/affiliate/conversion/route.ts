/**
 * Affiliate Conversion API Route
 * 
 * POST /api/affiliate/conversion
 * - Records affiliate conversions
 * - Attributes conversions to appropriate affiliate
 * - Calculates commission
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  recordConversion, 
  getConversion,
  getAffiliate,
  getClick,
  getPendingConversions,
  approveConversion,
  rejectConversion,
  initializeDemoData
} from "@/lib/affiliate/database";
import { AttributionModel } from "@/lib/affiliate-tracking";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIP } from "@/lib/security/bot-detection";
import { ENDPOINT_CONFIGS } from "@/lib/security/rate-limit-config-v2";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check rate limit
    const config = ENDPOINT_CONFIGS['/api/affiliate/conversion'];
    const rateLimit = await checkRateLimit(
      `affiliate:conversion:${ip}`,
      config?.limit || 20,
      config?.windowSeconds || 60
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many conversion requests", message: "Please try again later" },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config?.limit || 20),
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
      conversionType,
      value,
      currency = "USD",
      attributionModel = "last_touch",
      orderId,
      couponCode,
      clickId,
      sessionId,
    } = body;
    
    // Validate required fields
    if (!toolSlug || !conversionType) {
      return NextResponse.json(
        { error: "Missing required fields: toolSlug, conversionType" },
        { status: 400 }
      );
    }
    
    // Get attribution from cookie
    const cookieStore = await cookies();
    const attributionCookie = cookieStore.get("affiliate_attribution");
    
    let attributedAffiliateId: string | undefined;
    let attributionData: Record<string, unknown> | null = null;
    
    if (attributionCookie) {
      try {
        attributionData = JSON.parse(attributionCookie.value);
        if (attributionData) {
          attributedAffiliateId = attributionData.affiliateId as string;
        }
      } catch {
        console.warn("[Affiliate Conversion] Failed to parse attribution cookie");
      }
    }
    
    // Use provided click ID to get affiliate
    if (!attributedAffiliateId && clickId) {
      const click = await getClick(clickId);
      if (click) {
        attributedAffiliateId = click.affiliate_id;
      }
    }
    
    // Use session ID to get attribution
    if (!attributedAffiliateId && sessionId) {
      const { getSessionAttribution } = await import("@/lib/affiliate/database");
      const sessionData = await getSessionAttribution(sessionId);
      if (sessionData?.attribution?.affiliate_id) {
        attributedAffiliateId = sessionData.attribution.affiliate_id;
      }
    }
    
    // Default to direct if no attribution found
    if (!attributedAffiliateId) {
      attributedAffiliateId = "direct";
    }
    
    // Get affiliate for commission calculation
    let affiliate: { id: string; commission_rate: number; commission_type: 'percentage' | 'fixed'; fixed_amount?: number } | null = null;
    if (attributedAffiliateId !== "direct") {
      affiliate = await getAffiliate(attributedAffiliateId);
    }
    
    // Create conversion record
    const conversion = await recordConversion({
      affiliate_id: attributedAffiliateId,
      click_id: clickId,
      tool_slug: toolSlug,
      conversion_type: conversionType,
      value,
      currency,
      attribution_model: attributionModel as AttributionModel,
      status: "pending",
      metadata: {
        order_id: orderId,
        coupon_code: couponCode,
        session_id: sessionId,
      },
    }, affiliate || undefined);
    
    // Update attribution cookie
    if (attributionData) {
      attributionData.conversions = ((attributionData.conversions as number) || 0) + 1;
      attributionData.totalValue = ((attributionData.totalValue as number) || 0) + (value || 0);
      attributionData.lastTouchTimestamp = conversion.conversion_timestamp;
      
      cookieStore.set("affiliate_attribution", JSON.stringify(attributionData), {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
        sameSite: "lax",
      });
    }
    
    // Calculate commission for response
    let commissionAmount = 0;
    if (value && affiliate) {
      if (affiliate.commission_type === 'percentage') {
        commissionAmount = value * affiliate.commission_rate;
      } else {
        commissionAmount = affiliate.fixed_amount || 0;
      }
    }
    
    return NextResponse.json({
      success: true,
      conversionId: conversion.id,
      attributedAffiliateId,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      timestamp: conversion.conversion_timestamp,
      remaining: rateLimit.remaining,
    });
    
  } catch (error) {
    console.error("[Affiliate Conversion API] Error recording conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversionId = searchParams.get("conversionId");
    const affiliateId = searchParams.get("affiliateId");
    const status = searchParams.get("status") as "pending" | "approved" | "rejected" | "paid" | undefined;
    
    if (conversionId) {
      // Get specific conversion
      const conversion = await getConversion(conversionId);
      if (!conversion) {
        return NextResponse.json(
          { error: "Conversion not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: conversion,
      });
    } else if (affiliateId || status) {
      // Get pending conversions for affiliate or by status
      const conversions = await getPendingConversions(affiliateId || undefined);
      
      let filtered = conversions;
      if (status) {
        filtered = conversions.filter(c => c.status === status);
      }
      
      return NextResponse.json({
        success: true,
        data: filtered,
        count: filtered.length,
      });
    } else {
      return NextResponse.json(
        { error: "Missing conversionId or affiliateId parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Affiliate Conversion API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversionId, action, notes } = body;
    
    if (!conversionId || !action) {
      return NextResponse.json(
        { error: "Missing conversionId or action" },
        { status: 400 }
      );
    }
    
    let conversion;
    
    if (action === "approve") {
      conversion = await approveConversion(conversionId);
    } else if (action === "reject") {
      conversion = await rejectConversion(conversionId, notes);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }
    
    if (!conversion) {
      return NextResponse.json(
        { error: "Conversion not found or already processed" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: conversion,
    });
    
  } catch (error) {
    console.error("[Affiliate Conversion API] Error updating conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
