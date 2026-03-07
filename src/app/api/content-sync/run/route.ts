import { NextRequest, NextResponse } from "next/server";
import { runContentSync } from "@/lib/content-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CONTENT_SYNC_SECRET || process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function parseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (value === null) {
    return defaultValue;
  }

  return value === "1" || value === "true";
}

function parseSlugs(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const slugs = value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  return slugs.length > 0 ? slugs : undefined;
}

async function runFromRequest(request: NextRequest, body?: Record<string, unknown>) {
  const searchParams = request.nextUrl.searchParams;
  const locale = typeof body?.locale === "string" ? body.locale : searchParams.get("locale") || "en";
  const slugs = Array.isArray(body?.slugs)
    ? body.slugs.filter((slug): slug is string => typeof slug === "string")
    : parseSlugs(searchParams.get("slugs"));
  const limit = typeof body?.limit === "number"
    ? body.limit
    : searchParams.get("limit")
    ? Number.parseInt(searchParams.get("limit") || "", 10)
    : undefined;
  const force = typeof body?.force === "boolean"
    ? body.force
    : parseBoolean(searchParams.get("force"), false);
  const useLlm = typeof body?.useLlm === "boolean"
    ? body.useLlm
    : parseBoolean(searchParams.get("llm"), true);

  return runContentSync({
    locale,
    slugs,
    limit: typeof limit === "number" && !Number.isNaN(limit) ? limit : undefined,
    force,
    useLlm,
  });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runFromRequest(request);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("[Content Sync API] Failed to run sync:", error);
    return NextResponse.json({ error: "Failed to run content sync" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const report = await runFromRequest(request, body);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("[Content Sync API] Failed to run sync:", error);
    return NextResponse.json({ error: "Failed to run content sync" }, { status: 500 });
  }
}
