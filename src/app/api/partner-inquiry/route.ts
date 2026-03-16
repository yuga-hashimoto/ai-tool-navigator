import { NextRequest, NextResponse } from "next/server";
import { recordPartnerInquiry } from "@/lib/partner-inquiries";
import { appendPartnerInquiry } from "@/lib/google-sheets";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidEmail(body.email)) {
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
      if (errorMsg.includes('is not set') || errorMsg.includes('not configured')) {
        console.warn(`[PARTNER INQUIRY FALLBACK] Google Sheets not configured. Inquiry recorded locally: ${record.companyName} (${record.email})`);
      } else {
        console.warn('Google Sheets append failed, falling back to local DB record only:', sheetError);
        console.log(`[PARTNER INQUIRY FALLBACK] New inquiry recorded locally: ${record.companyName} (${record.email})`);
      }
    }

    return NextResponse.json({
      success: true,
      id: record.id,
    });
  } catch (error) {
    console.error("[Partner Inquiry API] Failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
