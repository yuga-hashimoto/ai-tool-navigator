/**
 * Affiliate Conversion API Route
 * 
 * POST /api/affiliate/conversion
 * - Records affiliate conversions
 * - Attributes conversions to appropriate affiliate
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// In-memory storage for demo (use database in production)
interface ConversionRecord {
  id: string;
  timestamp: string;
  affiliateId: string;
  toolSlug: string;
  conversionType: "signup" | "purchase" | "trial" | "upgrade";
  value?: number;
  currency: string;
  attributionModel: string;
  attributedAffiliateId: string;
}

const conversionStore: ConversionRecord[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      toolSlug,
      conversionType,
      value,
      currency = "USD",
      attributionModel = "last_touch",
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
    
    let attributedAffiliateId = "direct";
    let attributionData = null;
    
    if (attributionCookie) {
      try {
        attributionData = JSON.parse(attributionCookie.value);
        attributedAffiliateId = attributionData.affiliateId || "direct";
      } catch {
        console.warn("[Affiliate Conversion] Failed to parse attribution cookie");
      }
    }
    
    // Create conversion record
    const conversionRecord: ConversionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      affiliateId: attributedAffiliateId,
      toolSlug,
      conversionType,
      value,
      currency,
      attributionModel,
      attributedAffiliateId,
    };
    
    // Store conversion (in production, save to database)
    conversionStore.push(conversionRecord);
    
    // Update attribution cookie
    if (attributionData) {
      attributionData.conversions = (attributionData.conversions || 0) + 1;
      attributionData.totalValue = (attributionData.totalValue || 0) + (value || 0);
      attributionData.lastTouchTimestamp = conversionRecord.timestamp;
      
      cookieStore.set("affiliate_attribution", JSON.stringify(attributionData), {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
        sameSite: "lax",
      });
    }
    
    return NextResponse.json({
      success: true,
      conversionId: conversionRecord.id,
      attributedAffiliateId,
      timestamp: conversionRecord.timestamp,
    });
    
  } catch (error) {
    console.error("[Affiliate Conversion API] Error recording conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return conversion count for monitoring
  return NextResponse.json({
    totalConversions: conversionStore.length,
    timestamp: new Date().toISOString(),
  });
}
