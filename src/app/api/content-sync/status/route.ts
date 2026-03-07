import { NextResponse } from "next/server";
import { getContentSyncStatus } from "@/lib/content-sync";
import { getLocalizationCoverageReport } from "@/lib/localization-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    contentSync: getContentSyncStatus(),
    localization: getLocalizationCoverageReport(),
  });
}
