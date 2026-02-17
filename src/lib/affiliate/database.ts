
/**
 * Affiliate Database Mock Implementation
 *
 * This file provides mock implementations for affiliate database operations
 * since the original file was missing.
 */

export async function initializeDemoData() {
  return Promise.resolve();
}

export async function getAffiliateMetrics(
  affiliateId: string,
  startDate?: Date,
  endDate?: Date
) {
  return Promise.resolve({
    affiliate_id: affiliateId,
    affiliate_name: "Demo Affiliate",
    total_clicks: 100,
    unique_clicks: 80,
    total_conversions: 5,
    conversion_rate: 5.0,
    total_revenue: 500.0,
    total_commission: 50.0,
    average_order_value: 100.0,
    earnings_per_click: 0.5,
  });
}

export async function getOverviewMetrics(
  startDate?: Date,
  endDate?: Date
) {
  return Promise.resolve({
    total_affiliates: 10,
    active_affiliates: 5,
    total_clicks: 1000,
    total_conversions: 50,
    total_revenue: 5000.0,
    total_commission_paid: 500.0,
    pending_commission: 100.0,
    overall_conversion_rate: 5.0,
    average_commission_rate: 10.0,
    top_performers: [
      {
        affiliate_id: "aff1",
        top_tools: [
          {
            tool_slug: "tool-1",
            clicks: 100,
            conversions: 5,
            revenue: 500,
          }
        ],
        top_campaigns: [
          {
            campaign: "campaign-1",
            clicks: 50,
            conversions: 2,
            revenue: 200,
          }
        ]
      }
    ]
  });
}

export async function listAffiliates() {
  return Promise.resolve([
    {
      id: "aff1",
      name: "Affiliate One",
      slug: "affiliate-one",
      status: "active",
    },
    {
      id: "aff2",
      name: "Affiliate Two",
      slug: "affiliate-two",
      status: "inactive",
    }
  ]);
}

// Additional mock functions

export async function getClick(clickId: string) {
  return Promise.resolve({
    id: clickId,
    affiliate_id: "aff1",
    toolSlug: "tool-1",
    timestamp: new Date(),
  });
}

export async function getAffiliate(affiliateId: string) {
  return Promise.resolve({
    id: affiliateId,
    name: "Demo Affiliate",
    slug: "demo-affiliate",
    status: "active",
    commission_rate: 0.1,
    commission_type: 'percentage' as const,
    fixed_amount: 0,
  });
}

export async function getSessionAttribution(sessionId: string) {
  return Promise.resolve({
    attribution: {
      affiliate_id: "aff1"
    }
  });
}

export async function getAffiliateBySlug(slug: string) {
  return Promise.resolve({
    id: "aff1",
    name: "Demo Affiliate",
    slug: slug,
    status: "active",
    commissionRate: 0.1,
  });
}

export async function recordClick(data: any) {
  return Promise.resolve({
    id: "click-123",
    ...data
  });
}

export async function recordConversion(data: any, affiliate?: any) {
  return Promise.resolve({
    id: "conv-123",
    status: "pending",
    conversion_timestamp: new Date().toISOString(),
    ...data
  });
}

export async function getConversion(conversionId: string) {
  return Promise.resolve({
    id: conversionId,
    status: "pending",
    amount: 100,
    commission: 10,
  });
}

export async function getPendingConversions(affiliateId?: string) {
  return Promise.resolve([
    {
      id: "conv-123",
      affiliateId: "aff1",
      amount: 100,
      commission: 10,
      status: "pending",
      createdAt: new Date(),
    }
  ]);
}

export async function approveConversion(conversionId: string) {
  return Promise.resolve({
    id: conversionId,
    status: "approved",
  });
}

export async function rejectConversion(conversionId: string, notes?: string) {
  return Promise.resolve({
    id: conversionId,
    status: "rejected",
  });
}
