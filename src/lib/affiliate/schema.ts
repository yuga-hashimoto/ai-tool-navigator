
export type AttributionModel = 'last_touch' | 'first_touch' | 'linear';
export type ConversionStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Affiliate {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  fixed_amount?: number;
}

export interface AffiliateMetrics {
  affiliate_id: string;
  affiliate_name: string;
  total_clicks: number;
  unique_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
  total_commission: number;
  average_order_value: number;
  earnings_per_click: number;
}

export interface OverviewMetrics {
  total_affiliates: number;
  active_affiliates: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  total_commission_paid: number;
  pending_commission: number;
  overall_conversion_rate: number;
  average_commission_rate: number;
  top_performers: {
    top_tools: { tool_slug: string; clicks: number; conversions: number; revenue: number }[];
    top_campaigns: { campaign: string; clicks: number; conversions: number; revenue: number }[];
  }[];
}

export interface Conversion {
  id: string;
  affiliate_id: string;
  click_id?: string;
  tool_slug: string;
  conversion_type: string;
  value?: number;
  currency?: string;
  attribution_model: AttributionModel;
  status: ConversionStatus;
  conversion_timestamp: string;
  metadata?: Record<string, any>;
}
