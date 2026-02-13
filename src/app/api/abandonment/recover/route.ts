/**
 * Recovery Link Processing API Route
 * 
 * GET /api/abandonment/recover
 * - Processes recovery link clicks
 * - Attributes conversions back to original affiliate
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  processRecoveryClick, 
  markAsRecovered,
  generateRecoveryUrl,
  getAbandonmentBySession 
} from "@/lib/abandoned-link-recovery";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIP } from "@/lib/security/bot-detection";

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(
      `abandonment:recover:${ip}`,
      30,
      60
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests", message: "Please try again later" },
        { status: 429 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const recoverAffiliate = searchParams.get("recover_affiliate");
    const recoverTool = searchParams.get("recover_tool");
    const timestamp = searchParams.get("recover_ts");
    
    if (!sessionId || !recoverAffiliate || !recoverTool) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    // Check if recovery link is expired (24 hours)
    if (timestamp) {
      const linkAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (linkAge > maxAge) {
        return NextResponse.json(
          { error: "Recovery link has expired" },
          { status: 410 }
        );
      }
    }
    
    // Process the recovery click
    const result = await processRecoveryClick(sessionId, recoverAffiliate, recoverTool);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to process recovery" },
        { status: 500 }
      );
    }
    
    // Return redirect to the tool with attribution
    const redirectUrl = new URL(`https://${process.env.NEXT_PUBLIC_DOMAIN}/tools/${recoverTool}`);
    redirectUrl.searchParams.set('from_recovery', 'true');
    redirectUrl.searchParams.set('recovered_session', sessionId);
    
    return NextResponse.redirect(redirectUrl.toString(), 302);
    
  } catch (error) {
    console.error("[Recovery API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST - Mark conversion as recovered
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { sessionId, value, currency = 'USD' } = body;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }
    
    // Get abandonment record
    const abandonment = await getAbandonmentBySession(sessionId);
    
    if (!abandonment) {
      return NextResponse.json(
        { error: "Abandonment not found" },
        { status: 404 }
      );
    }
    
    // Check if already recovered
    if (abandonment.recoveryStatus === 'recovered') {
      return NextResponse.json({
        success: true,
        message: "Already recovered",
        sessionId,
        wasAlreadyRecovered: true,
      });
    }
    
    // Mark as recovered
    const success = await markAsRecovered(sessionId);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark as recovered" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Recovery recorded",
      sessionId,
      originalAffiliateId: abandonment.affiliateId,
      value,
    });
    
  } catch (error) {
    console.error("[Recovery API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
