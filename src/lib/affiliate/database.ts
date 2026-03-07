import fs from "fs";
import path from "path";
import crypto from "crypto";
import affiliatesSeed from "../../../data/affiliates.json";

type CommissionType = "percentage" | "fixed";
type ConversionStatus = "pending" | "approved" | "rejected" | "paid";

interface SeedAffiliate {
  id: string;
  name: string;
  url: string;
  cta?: string;
  tags?: string[];
}

interface StoredAffiliate {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  url?: string;
  commission_rate: number;
  commission_type: CommissionType;
  fixed_amount?: number;
  created_at: string;
  updated_at: string;
}

interface StoredClick {
  id: string;
  affiliate_id: string;
  tool_slug: string;
  tool_name?: string;
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  user_agent?: string;
  ip_hash?: string;
  referrer_domain?: string;
  country?: string;
  device_type?: "desktop" | "mobile" | "tablet";
  browser?: string;
  page_url?: string;
  position?: string;
  session_id?: string;
  click_timestamp: string;
}

interface StoredConversion {
  id: string;
  affiliate_id: string;
  click_id?: string;
  tool_slug: string;
  conversion_type: "signup" | "purchase" | "trial" | "upgrade";
  value?: number;
  currency?: string;
  attribution_model: string;
  status: ConversionStatus;
  commission_amount: number;
  conversion_timestamp: string;
  metadata?: Record<string, unknown>;
  notes?: string;
}

interface SessionAttributionRecord {
  affiliate_id: string;
  last_click_id: string;
  last_touch_timestamp: string;
}

interface AffiliateState {
  version: number;
  initialized_at: string;
  updated_at: string;
  affiliates: StoredAffiliate[];
  clicks: StoredClick[];
  conversions: StoredConversion[];
  session_attribution: Record<string, SessionAttributionRecord>;
}

interface ToolRollup {
  tool_slug: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface CampaignRollup {
  campaign: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

const STATE_FILE = path.join(process.cwd(), "data", "affiliate-state.json");
const DEFAULT_COMMISSION_RATE = 0.1;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function ensureStateFile() {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createSeedAffiliates(): StoredAffiliate[] {
  const now = new Date().toISOString();

  return (affiliatesSeed as SeedAffiliate[]).map((affiliate) => ({
    id: affiliate.id,
    name: affiliate.name,
    slug: slugify(affiliate.id),
    status: "active",
    url: affiliate.url,
    commission_rate: DEFAULT_COMMISSION_RATE,
    commission_type: "percentage",
    fixed_amount: 0,
    created_at: now,
    updated_at: now,
  }));
}

function createEmptyState(): AffiliateState {
  const now = new Date().toISOString();

  return {
    version: 1,
    initialized_at: now,
    updated_at: now,
    affiliates: createSeedAffiliates(),
    clicks: [],
    conversions: [],
    session_attribution: {},
  };
}

function readState(): AffiliateState {
  ensureStateFile();

  if (!fs.existsSync(STATE_FILE)) {
    const initialState = createEmptyState();
    fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
    return initialState;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as AffiliateState;
    if (!parsed.affiliates || !parsed.clicks || !parsed.conversions || !parsed.session_attribution) {
      throw new Error("Invalid affiliate state file");
    }
    return parsed;
  } catch {
    const repairedState = createEmptyState();
    fs.writeFileSync(STATE_FILE, JSON.stringify(repairedState, null, 2));
    return repairedState;
  }
}

function writeState(state: AffiliateState) {
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function withinRange(value: string, startDate?: Date, endDate?: Date): boolean {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  if (startDate && timestamp < startDate.getTime()) {
    return false;
  }

  if (endDate && timestamp > endDate.getTime()) {
    return false;
  }

  return true;
}

function calculateCommission(
  value: number | undefined,
  affiliate?: Pick<StoredAffiliate, "commission_rate" | "commission_type" | "fixed_amount">
): number {
  if (!affiliate) {
    return 0;
  }

  if (affiliate.commission_type === "fixed") {
    return affiliate.fixed_amount || 0;
  }

  return value ? value * affiliate.commission_rate : 0;
}

function ensureAffiliateRecord(
  state: AffiliateState,
  input: { id?: string; slug?: string; name?: string; url?: string }
): StoredAffiliate {
  const lookupValue = input.id || input.slug;
  const normalizedSlug = slugify(input.slug || input.id || input.name || "unknown-affiliate");
  let affiliate = state.affiliates.find(
    (item) => item.id === lookupValue || item.slug === normalizedSlug
  );

  if (!affiliate) {
    const now = new Date().toISOString();
    affiliate = {
      id: input.id || normalizedSlug,
      name: input.name || input.id || normalizedSlug,
      slug: normalizedSlug,
      status: "active",
      url: input.url,
      commission_rate: DEFAULT_COMMISSION_RATE,
      commission_type: "percentage",
      fixed_amount: 0,
      created_at: now,
      updated_at: now,
    };
    state.affiliates.push(affiliate);
  } else if (input.url && !affiliate.url) {
    affiliate.url = input.url;
    affiliate.updated_at = new Date().toISOString();
  }

  return affiliate;
}

function aggregateTools(clicks: StoredClick[], conversions: StoredConversion[]): ToolRollup[] {
  const rollup = new Map<string, ToolRollup>();

  clicks.forEach((click) => {
    const current = rollup.get(click.tool_slug) || {
      tool_slug: click.tool_slug,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };
    current.clicks += 1;
    rollup.set(click.tool_slug, current);
  });

  conversions.forEach((conversion) => {
    const current = rollup.get(conversion.tool_slug) || {
      tool_slug: conversion.tool_slug,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };
    current.conversions += 1;
    current.revenue += conversion.value || 0;
    rollup.set(conversion.tool_slug, current);
  });

  return Array.from(rollup.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 10);
}

function aggregateCampaigns(clicks: StoredClick[], conversions: StoredConversion[]): CampaignRollup[] {
  const rollup = new Map<string, CampaignRollup>();

  clicks.forEach((click) => {
    const campaignName = click.campaign || "direct";
    const current = rollup.get(campaignName) || {
      campaign: campaignName,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };
    current.clicks += 1;
    rollup.set(campaignName, current);
  });

  conversions.forEach((conversion) => {
    const linkedClick = clicks.find((click) => click.id === conversion.click_id);
    const campaignName = linkedClick?.campaign || "direct";
    const current = rollup.get(campaignName) || {
      campaign: campaignName,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };
    current.conversions += 1;
    current.revenue += conversion.value || 0;
    rollup.set(campaignName, current);
  });

  return Array.from(rollup.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 10);
}

export async function initializeDemoData() {
  const state = readState();
  if (state.affiliates.length === 0) {
    state.affiliates = createSeedAffiliates();
    writeState(state);
  }
  return Promise.resolve();
}

export async function getAffiliateMetrics(
  affiliateId: string,
  startDate?: Date,
  endDate?: Date
) {
  const state = readState();
  const affiliate = state.affiliates.find((item) => item.id === affiliateId || item.slug === affiliateId);

  if (!affiliate) {
    return null;
  }

  const clicks = state.clicks.filter(
    (click) =>
      click.affiliate_id === affiliate.id &&
      withinRange(click.click_timestamp, startDate, endDate)
  );
  const conversions = state.conversions.filter(
    (conversion) =>
      conversion.affiliate_id === affiliate.id &&
      withinRange(conversion.conversion_timestamp, startDate, endDate)
  );

  const uniqueClicks = new Set(
    clicks.map((click) => click.session_id || click.ip_hash || click.id)
  ).size;
  const totalRevenue = conversions.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalCommission = conversions.reduce((sum, item) => sum + item.commission_amount, 0);
  const totalConversions = conversions.length;
  const totalClicks = clicks.length;

  return {
    affiliate_id: affiliate.id,
    affiliate_name: affiliate.name,
    total_clicks: totalClicks,
    unique_clicks: uniqueClicks,
    total_conversions: totalConversions,
    conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    total_revenue: totalRevenue,
    total_commission: totalCommission,
    average_order_value: totalConversions > 0 ? totalRevenue / totalConversions : 0,
    earnings_per_click: totalClicks > 0 ? totalCommission / totalClicks : 0,
    top_tools: aggregateTools(clicks, conversions),
    top_campaigns: aggregateCampaigns(clicks, conversions),
  };
}

export async function getOverviewMetrics(startDate?: Date, endDate?: Date) {
  const state = readState();
  const clicks = state.clicks.filter((click) => withinRange(click.click_timestamp, startDate, endDate));
  const conversions = state.conversions.filter((conversion) =>
    withinRange(conversion.conversion_timestamp, startDate, endDate)
  );

  const top_performers = await Promise.all(
    state.affiliates.map(async (affiliate) => {
      const metrics = await getAffiliateMetrics(affiliate.id, startDate, endDate);
      return metrics
        ? {
            affiliate_id: affiliate.id,
            affiliate_name: affiliate.name,
            total_clicks: metrics.total_clicks,
            total_conversions: metrics.total_conversions,
            total_revenue: metrics.total_revenue,
            total_commission: metrics.total_commission,
            top_tools: metrics.top_tools,
            top_campaigns: metrics.top_campaigns,
          }
        : null;
    })
  );

  const filteredPerformers = top_performers
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.total_commission - a.total_commission)
    .slice(0, 10);

  const totalRevenue = conversions.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalCommissionPaid = conversions
    .filter((item) => item.status === "paid" || item.status === "approved")
    .reduce((sum, item) => sum + item.commission_amount, 0);
  const pendingCommission = conversions
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + item.commission_amount, 0);

  return {
    total_affiliates: state.affiliates.length,
    active_affiliates: state.affiliates.filter((affiliate) => affiliate.status === "active").length,
    total_clicks: clicks.length,
    total_conversions: conversions.length,
    total_revenue: totalRevenue,
    total_commission_paid: totalCommissionPaid,
    pending_commission: pendingCommission,
    overall_conversion_rate: clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0,
    average_commission_rate:
      state.affiliates.length > 0
        ? (state.affiliates.reduce((sum, affiliate) => sum + affiliate.commission_rate, 0) /
            state.affiliates.length) *
          100
        : 0,
    top_performers: filteredPerformers,
  };
}

export async function listAffiliates() {
  return readState().affiliates;
}

export async function getClick(clickId: string) {
  return readState().clicks.find((click) => click.id === clickId) || null;
}

export async function getAffiliate(affiliateId: string) {
  const state = readState();
  return (
    state.affiliates.find((affiliate) => affiliate.id === affiliateId || affiliate.slug === affiliateId) ||
    null
  );
}

export async function getSessionAttribution(sessionId: string) {
  const state = readState();
  const attribution = state.session_attribution[sessionId];
  if (!attribution) {
    return null;
  }

  return { attribution };
}

export async function getAffiliateBySlug(slug: string) {
  const normalizedSlug = slugify(slug);
  const state = readState();
  const existing =
    state.affiliates.find((affiliate) => affiliate.slug === normalizedSlug || affiliate.id === slug) || null;

  if (existing) {
    return existing;
  }

  const affiliate = ensureAffiliateRecord(state, {
    id: normalizedSlug,
    slug: normalizedSlug,
    name: slug,
  });
  writeState(state);
  return affiliate;
}

export async function recordClick(
  data: Omit<StoredClick, "id" | "click_timestamp"> & { affiliate_name?: string; affiliate_url?: string }
) {
  const state = readState();
  const affiliate = ensureAffiliateRecord(state, {
    id: data.affiliate_id,
    slug: data.affiliate_id,
    name: data.affiliate_name || data.tool_name || data.affiliate_id,
    url: data.affiliate_url,
  });

  const click: StoredClick = {
    ...data,
    affiliate_id: affiliate.id,
    id: createId("click"),
    click_timestamp: new Date().toISOString(),
  };

  state.clicks.push(click);

  if (click.session_id) {
    state.session_attribution[click.session_id] = {
      affiliate_id: affiliate.id,
      last_click_id: click.id,
      last_touch_timestamp: click.click_timestamp,
    };
  }

  writeState(state);
  return click;
}

export async function recordConversion(
  data: Omit<StoredConversion, "id" | "commission_amount" | "conversion_timestamp">,
  affiliate?: Pick<StoredAffiliate, "id" | "commission_rate" | "commission_type" | "fixed_amount">
) {
  const state = readState();
  const affiliateRecord =
    affiliate ||
    ensureAffiliateRecord(state, {
      id: data.affiliate_id,
      slug: data.affiliate_id,
      name: data.tool_slug,
    });

  const conversion: StoredConversion = {
    ...data,
    affiliate_id: affiliateRecord.id,
    id: createId("conv"),
    commission_amount: Math.round(calculateCommission(data.value, affiliateRecord) * 100) / 100,
    conversion_timestamp: new Date().toISOString(),
  };

  state.conversions.push(conversion);
  writeState(state);
  return conversion;
}

export async function getConversion(conversionId: string) {
  return readState().conversions.find((conversion) => conversion.id === conversionId) || null;
}

export async function getPendingConversions(affiliateId?: string) {
  return readState().conversions.filter(
    (conversion) =>
      conversion.status === "pending" &&
      (!affiliateId || conversion.affiliate_id === affiliateId)
  );
}

export async function approveConversion(conversionId: string) {
  const state = readState();
  const conversion = state.conversions.find((item) => item.id === conversionId);
  if (!conversion || conversion.status !== "pending") {
    return null;
  }

  conversion.status = "approved";
  writeState(state);
  return conversion;
}

export async function rejectConversion(conversionId: string, notes?: string) {
  const state = readState();
  const conversion = state.conversions.find((item) => item.id === conversionId);
  if (!conversion || conversion.status !== "pending") {
    return null;
  }

  conversion.status = "rejected";
  conversion.notes = notes;
  writeState(state);
  return conversion;
}
