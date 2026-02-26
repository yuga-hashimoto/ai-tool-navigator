
import { Affiliate, AffiliateMetrics, OverviewMetrics, Conversion, AttributionModel, ConversionStatus } from './schema';

export async function initializeDemoData() {
  // Mock initialization
}

export async function getAffiliateMetrics(affiliateId: string, startDate?: Date, endDate?: Date): Promise<AffiliateMetrics | null> {
  return {
    affiliate_id: affiliateId,
    affiliate_name: "Demo Affiliate",
    total_clicks: 100,
    unique_clicks: 80,
    total_conversions: 5,
    conversion_rate: 5,
    total_revenue: 500,
    total_commission: 50,
    average_order_value: 100,
    earnings_per_click: 0.5,
  };
}

export async function getOverviewMetrics(startDate?: Date, endDate?: Date): Promise<OverviewMetrics> {
  return {
    total_affiliates: 10,
    active_affiliates: 5,
    total_clicks: 1000,
    total_conversions: 50,
    total_revenue: 5000,
    total_commission_paid: 500,
    pending_commission: 100,
    overall_conversion_rate: 5,
    average_commission_rate: 10,
    top_performers: [],
  };
}

export async function listAffiliates(): Promise<Affiliate[]> {
  return [
    {
      id: "aff_1",
      name: "Demo Affiliate 1",
      slug: "demo-1",
      status: "active",
      commission_rate: 0.1,
      commission_type: "percentage",
    }
  ];
}

export async function recordConversion(data: any, affiliate?: any): Promise<Conversion> {
  return {
    id: "conv_" + Date.now(),
    affiliate_id: data.affiliate_id || "direct",
    tool_slug: data.tool_slug,
    conversion_type: data.conversion_type,
    attribution_model: data.attribution_model,
    status: "pending",
    conversion_timestamp: new Date().toISOString(),
    value: data.value,
  };
}

export async function getConversion(id: string): Promise<Conversion | null> {
  return null;
}

export async function getAffiliate(id: string): Promise<Affiliate | null> {
  return {
    id,
    name: "Demo Affiliate",
    slug: "demo",
    status: "active",
    commission_rate: 0.1,
    commission_type: "percentage",
  };
}

export async function getClick(id: string): Promise<any | null> {
  return null;
}

export async function getPendingConversions(affiliateId?: string): Promise<Conversion[]> {
  return [];
}

export async function approveConversion(id: string): Promise<Conversion | null> {
  return null;
}

export async function rejectConversion(id: string, notes?: string): Promise<Conversion | null> {
  return null;
}

export async function getSessionAttribution(sessionId: string): Promise<any> {
    return { attribution: { affiliate_id: 'mock_affiliate' } };
}

export async function getAffiliateBySlug(slug: string): Promise<Affiliate | null> {
  return {
    id: "aff_" + slug,
    name: "Demo Affiliate",
    slug,
    status: "active",
    commission_rate: 0.1,
    commission_type: "percentage",
  };
}

export async function recordClick(data: any): Promise<any> {
  return { id: "click_" + Date.now() };
}
