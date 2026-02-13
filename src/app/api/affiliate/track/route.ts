/**
 * Affiliate Tracking API Route
 * 
 * POST /api/affiliate/track
 * - Records affiliate link clicks
 * - Stores attribution data
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// In-memory storage for demo (use database in production)
interface AffiliateClickRecord {
  id: string;
  timestamp: string;
  toolSlug: string;
  toolName: string;
  affiliateId: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
  pageUrl: string;
  position?: string;
  userAgent?: string;
  referrer?: string;
  ipHash?: string;
}

const clickStore: AffiliateClickRecord[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      toolSlug,
      toolName,
      affiliateId,
      source,
      medium,
      campaign,
      content,
      term,
      pageUrl,
      position,
    } = body;
    
    // Validate required fields
    if (!toolSlug || !affiliateId) {
      return NextResponse.json(
        { error: "Missing required fields: toolSlug, affiliateId" },
        { status: 400 }
      );
    }
    
    // Create click record
    const clickRecord: AffiliateClickRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      toolSlug,
      toolName: toolName || "",
      affiliateId,
      source: source || "direct",
      medium: medium || "referral",
      campaign: campaign || "",
      content,
      term,
      pageUrl: pageUrl || "",
      position,
      userAgent: request.headers.get("user-agent") || undefined,
      referrer: request.headers.get("referer") || undefined,
    };
    
    // Store click (in production, save to database)
    clickStore.push(clickRecord);
    
    // Set attribution cookie
    const cookieStore = await cookies();
    const attributionCookie = JSON.stringify({
      affiliateId,
      source: source || "direct",
      medium: medium || "referral",
      campaign: campaign || "",
      content,
      term,
      firstTouchTimestamp: clickRecord.timestamp,
      lastTouchTimestamp: clickRecord.timestamp,
      conversions: 0,
      totalValue: 0,
    });
    
    cookieStore.set("affiliate_attribution", attributionCookie, {
      httpOnly: false, // Allow JavaScript access for client-side tracking
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
      sameSite: "lax",
    });
    
    // Return success with click ID
    return NextResponse.json({
      success: true,
      clickId: clickRecord.id,
      timestamp: clickRecord.timestamp,
    });
    
  } catch (error) {
    console.error("[Affiliate API] Error recording click:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return click count for monitoring
  return NextResponse.json({
    totalClicks: clickStore.length,
    timestamp: new Date().toISOString(),
  });
}
