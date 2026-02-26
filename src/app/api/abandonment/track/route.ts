/**
 * Abandonment Tracking API Route
 * 
 * POST /api/abandonment/track
 * - Records abandonment events (exit intent, tab close, timeout)
 * - Stores abandonment data for recovery campaigns
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  recordAbandonment, 
  getAbandonmentBySession,
  updateRecoveryStatus 
} from "@/lib/abandoned-link-recovery";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIP } from "@/lib/security/bot-detection";
import { ENDPOINT_CONFIGS } from "@/lib/security/rate-limit-config-v2";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check rate limit
    const config = ENDPOINT_CONFIGS['/api/abandonment/track'] || { limit: 100, windowSeconds: 60 };
    const rateLimit = await checkRateLimit(
      `abandonment:track:${ip}`,
      config.limit,
      config.windowSeconds
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many tracking requests", message: "Please try again later" },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }
    
    const body = await request.json();
    
    const {
      sessionId,
      toolSlug,
      toolName,
      affiliateId,
      abandonmentType,
      timeOnPage,
      scrollDepth,
      entryPage,
      exitPage,
      source = 'direct',
      medium = 'referral',
      campaign,
    } = body;
    
    // Validate required fields
    if (!sessionId || !toolSlug || !toolName || !abandonmentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if abandonment already recorded    const existing = for this session
 await getAbandonmentBySession(sessionId);
    
    if (existing) {
      // Update existing record instead of creating duplicate
      await updateRecoveryStatus(sessionId, {
        recoveryStatus: 'pending',
        recoveryAttempts: existing.recoveryAttempts + 1,
      });
      
      return NextResponse.json({
        success: true,
        message: "Abandonment already recorded",
        sessionId,
        existingRecord: true,
        remaining: rateLimit.remaining,
      });
    }
    
    // Record new abandonment
    const abandonment = await recordAbandonment({
      sessionId,
      affiliateId: affiliateId || 'direct',
      toolSlug,
      toolName,
      source,
      medium,
      campaign,
      entryPage,
      exitPage,
      timeOnPage: timeOnPage || 0,
      scrollDepth,
      abandonmentType,
      recoveryStatus: 'pending',
    });
    
    if (!abandonment) {
      return NextResponse.json(
        { error: "Failed to record abandonment" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      abandonmentId: abandonment.id,
      sessionId,
      remaining: rateLimit.remaining,
    });
    
  } catch (error) {
    console.error("[Abandonment Track API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const status = searchParams.get("status");
    
    if (sessionId) {
      const abandonment = await getAbandonmentBySession(sessionId);
      
      if (!abandonment) {
        return NextResponse.json(
          { error: "Abandonment not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: abandonment,
      });
    }
    
    // Return error if no sessionId provided
    return NextResponse.json(
      { error: "Missing sessionId parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Abandonment Track API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
