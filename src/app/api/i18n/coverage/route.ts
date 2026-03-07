import { NextResponse } from "next/server";
import { getLocalizationCoverageReport } from "@/lib/localization-audit";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getLocalizationCoverageReport(),
  });
}
