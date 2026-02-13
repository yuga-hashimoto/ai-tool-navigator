/**
 * Affiliate Analytics API Route
 * 
 * GET /api/affiliate/analytics
 * - Returns affiliate performance metrics
 * - Supports date range filtering
 * - Provides aggregated statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  getAffiliateMetrics, 
  getOverviewMetrics, 
  listAffiliates,
  initializeDemoData 
} from "@/lib/affiliate/database";

export async function GET(request: NextRequest) {
  try {
    // Initialize demo data
    await initializeDemoData();
    
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get("affiliateId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "affiliate";
    const format = searchParams.get("format") || "json";
    
    // Parse date range
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    
    if (groupBy === "affiliate" && affiliateId) {
      // Return specific affiliate metrics
      const metrics = await getAffiliateMetrics(affiliateId, parsedStartDate, parsedEndDate);
      
      if (!metrics) {
        return NextResponse.json(
          { error: "Affiliate not found" },
          { status: 404 }
        );
      }
      
      if (format === "csv") {
        // Export as CSV
        const csv = convertMetricsToCSV(metrics);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="affiliate-${affiliateId}-metrics.csv"`,
          },
        });
      }
      
      return NextResponse.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
      
    } else if (groupBy === "overview") {
      // Return overview metrics
      const overview = await getOverviewMetrics(parsedStartDate, parsedEndDate);
      
      if (format === "csv") {
        const csv = convertOverviewToCSV(overview);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="affiliate-overview.csv"`,
          },
        });
      }
      
      return NextResponse.json({
        success: true,
        data: overview,
        timestamp: new Date().toISOString(),
      });
      
    } else if (groupBy === "affiliates") {
      // Return all affiliates list with summary
      const affiliates = await listAffiliates();
      
      const affiliateSummaries = await Promise.all(
        affiliates.map(async (affiliate) => {
          const metrics = await getAffiliateMetrics(affiliate.id, parsedStartDate, parsedEndDate);
          return {
            id: affiliate.id,
            name: affiliate.name,
            slug: affiliate.slug,
            status: affiliate.status,
            total_clicks: metrics?.total_clicks || 0,
            total_conversions: metrics?.total_conversions || 0,
            total_revenue: metrics?.total_revenue || 0,
            total_commission: metrics?.total_commission || 0,
            conversion_rate: metrics?.conversion_rate || 0,
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        data: affiliateSummaries,
        count: affiliateSummaries.length,
        timestamp: new Date().toISOString(),
      });
      
    } else if (groupBy === "tool") {
      // Return metrics grouped by tool
      const overview = await getOverviewMetrics(parsedStartDate, parsedEndDate);
      const toolMetrics = aggregateByTool(overview);
      
      return NextResponse.json({
        success: true,
        data: toolMetrics,
        groupBy: "tool",
        timestamp: new Date().toISOString(),
      });
      
    } else if (groupBy === "campaign") {
      // Return metrics grouped by campaign
      const overview = await getOverviewMetrics(parsedStartDate, parsedEndDate);
      const campaignMetrics = aggregateByCampaign(overview);
      
      return NextResponse.json({
        success: true,
        data: campaignMetrics,
        groupBy: "campaign",
        timestamp: new Date().toISOString(),
      });
      
    } else {
      // Default: return overview
      const overview = await getOverviewMetrics(parsedStartDate, parsedEndDate);
      return NextResponse.json({
        success: true,
        data: overview,
        timestamp: new Date().toISOString(),
      });
    }
    
  } catch (error) {
    console.error("[Affiliate Analytics API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CSV conversion helpers
function convertMetricsToCSV(metrics: Awaited<ReturnType<typeof getAffiliateMetrics>>): string {
  if (!metrics) return "";
  
  const headers = [
    "Affiliate ID",
    "Affiliate Name",
    "Total Clicks",
    "Unique Clicks",
    "Total Conversions",
    "Conversion Rate (%)",
    "Total Revenue",
    "Total Commission",
    "Average Order Value",
    "Earnings Per Click",
  ];
  
  const row = [
    metrics.affiliate_id,
    metrics.affiliate_name,
    metrics.total_clicks.toString(),
    metrics.unique_clicks.toString(),
    metrics.total_conversions.toString(),
    metrics.conversion_rate.toFixed(2),
    metrics.total_revenue.toFixed(2),
    metrics.total_commission.toFixed(2),
    metrics.average_order_value.toFixed(2),
    metrics.earnings_per_click.toFixed(4),
  ];
  
  return [headers.join(","), row.join(",")].join("\n");
}

function convertOverviewToCSV(overview: Awaited<ReturnType<typeof getOverviewMetrics>>): string {
  const headers = [
    "Metric",
    "Value",
  ];
  
  const rows = [
    ["Total Affiliates", overview.total_affiliates.toString()],
    ["Active Affiliates", overview.active_affiliates.toString()],
    ["Total Clicks", overview.total_clicks.toString()],
    ["Total Conversions", overview.total_conversions.toString()],
    ["Total Revenue", overview.total_revenue.toFixed(2)],
    ["Total Commission Paid", overview.total_commission_paid.toFixed(2)],
    ["Pending Commission", overview.pending_commission.toFixed(2)],
    ["Overall Conversion Rate (%)", overview.overall_conversion_rate.toFixed(2)],
    ["Average Commission Rate (%)", overview.average_commission_rate.toFixed(2)],
  ];
  
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

function aggregateByTool(overview: Awaited<ReturnType<typeof getOverviewMetrics>>) {
  const toolMap = new Map<string, {
    toolSlug: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
  }>();
  
  // Aggregate from top performers
  overview.top_performers.forEach(affiliate => {
    affiliate.top_tools.forEach(tool => {
      const existing = toolMap.get(tool.tool_slug) || {
        toolSlug: tool.tool_slug,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        commission: 0,
      };
      existing.clicks += tool.clicks;
      existing.conversions += tool.conversions;
      existing.revenue += tool.revenue;
      toolMap.set(tool.tool_slug, existing);
    });
  });
  
  return Array.from(toolMap.values())
    .map(({ toolSlug, ...data }) => ({ tool_slug: toolSlug, ...data }))
    .sort((a, b) => b.clicks - a.clicks);
}

function aggregateByCampaign(overview: Awaited<ReturnType<typeof getOverviewMetrics>>) {
  const campaignMap = new Map<string, {
    campaign: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>();
  
  overview.top_performers.forEach(affiliate => {
    affiliate.top_campaigns.forEach(campaign => {
      const existing = campaignMap.get(campaign.campaign) || {
        campaign: campaign.campaign,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      };
      existing.clicks += campaign.clicks;
      existing.conversions += campaign.conversions;
      existing.revenue += campaign.revenue;
      campaignMap.set(campaign.campaign, existing);
    });
  });
  
  return Array.from(campaignMap.values())
    .sort((a, b) => b.clicks - a.clicks);
}
