import { NextRequest, NextResponse } from "next/server";
import { recordPartnerInquiry } from "@/lib/partner-inquiries";
import { appendPartnerInquiry } from "@/lib/google-sheets";
import { securityCheck, createRateLimitHeaders } from "@/lib/security";
import { getClientIP } from "@/lib/security/bot-detection";
import { trackRequest } from "@/lib/security/anomaly-detection";
import { logFormSubmission } from "@/lib/security/audit-log";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const path = request.nextUrl.pathname;

  try {
    // Security check
    const securityResult = await securityCheck(request);

    if (!securityResult.allowed) {
      if (securityResult.challenge === "block") {
        return NextResponse.json(
          { error: "Forbidden", message: securityResult.reason },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Verification Required", message: securityResult.reason, requiresCaptcha: true },
        { status: 429 }
      );
    }

    // Rate Limit Check
    const submitKey = `partner_inquiry:${ip}`;
    const { checkRateLimit } = await import("@/lib/security/rate-limiter");
    const { RATE_LIMITS } = await import("@/lib/security/rate-limit-config");
    const rateLimit = await checkRateLimit(
      submitKey,
      RATE_LIMITS.API.submit.requests,
      RATE_LIMITS.API.submit.windowSeconds
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many submission attempts", message: "Please try again later" },
        { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime) }
      );
    }

    const body = (await request.json()) as {
      inquiryType?: "advertise" | "sponsor";
      companyName?: string;
      contactName?: string;
      email?: string;
      websiteUrl?: string;
      packageInterest?: string;
      monthlyBudget?: string;
      message?: string;
      locale?: string;
    };

    if (
      !body.inquiryType ||
      !body.companyName ||
      !body.contactName ||
      !body.email ||
      !body.websiteUrl ||
      !body.message
    ) {
      await trackRequest(ip, path, "POST", 400, userAgent);
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidEmail(body.email)) {
      await trackRequest(ip, path, "POST", 400, userAgent);
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const record = await recordPartnerInquiry({
      inquiryType: body.inquiryType,
      companyName: body.companyName,
      contactName: body.contactName,
      email: body.email,
      websiteUrl: body.websiteUrl,
      packageInterest: body.packageInterest,
      monthlyBudget: body.monthlyBudget,
      message: body.message,
      locale: body.locale || "en",
    });

    try {
      await appendPartnerInquiry({
        inquiryType: record.inquiryType,
        companyName: record.companyName,
        contactName: record.contactName,
        email: record.email,
        websiteUrl: record.websiteUrl,
        packageInterest: record.packageInterest,
        monthlyBudget: record.monthlyBudget,
        message: record.message,
        locale: record.locale,
      });
      console.log(`[PARTNER INQUIRY] New inquiry appended to Google Sheets: ${record.companyName} (${record.email})`);
    } catch (sheetError) {
      const errorMsg = sheetError instanceof Error ? sheetError.message : String(sheetError);
      if (errorMsg.includes('not configured')) {
        console.warn(`[PARTNER INQUIRY FALLBACK] Google Sheets not configured. Inquiry recorded locally: ${record.companyName} (${record.email})`);
      } else {
        console.warn('Google Sheets append failed, falling back to local DB record only:', sheetError);
        console.log(`[PARTNER INQUIRY FALLBACK] New inquiry recorded locally: ${record.companyName} (${record.email})`);
      }
    }

    await trackRequest(ip, path, "POST", 200, userAgent);
    await logFormSubmission(ip, path, "partner_inquiry", false, userAgent);

    return NextResponse.json(
      {
        success: true,
        id: record.id,
      },
      {
        status: 200,
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );
  } catch (error) {
    console.error("[Partner Inquiry API] Failed:", error);
    await trackRequest(ip, path, "POST", 500, userAgent);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
