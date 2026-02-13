/**
 * Email Capture API Route
 * 
 * POST /api/abandonment/capture-email
 * - Captures visitor email for recovery campaigns
 */

import { NextRequest, NextResponse } from "next/server";
import { captureVisitorEmail, getAbandonmentBySession } from "@/lib/abandoned-link-recovery";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { getClientIP } from "@/lib/security/bot-detection";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check rate limit (stricter for email capture)
    const rateLimit = await checkRateLimit(
      `abandonment:email:${ip}`,
      10, // 10 requests
      60 // per minute
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests", message: "Please try again later" },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }
    
    const body = await request.json();
    
    const { sessionId, email, visitorId } = body;
    
    // Validate required fields
    if (!sessionId || !email) {
      return NextResponse.json(
        { error: "Missing sessionId or email" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Check if abandonment record exists
    const existing = await getAbandonmentBySession(sessionId);
    
    if (!existing) {
      return NextResponse.json(
        { error: "No abandonment record found for this session" },
        { status: 404 }
      );
    }
    
    // Capture the email
    const result = await captureVisitorEmail(sessionId, email, visitorId);
    
    if (!result) {
      return NextResponse.json(
        { error: "Failed to capture email" },
        { status: 500 }
      );
    }
    
    // TODO: Send welcome email with recovery link
    
    return NextResponse.json({
      success: true,
      message: "Email captured successfully",
      sessionId,
      email: email.substring(0, 3) + '***@***', // Masked email for response
      remaining: rateLimit.remaining,
    });
    
  } catch (error) {
    console.error("[Capture Email API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
