/**
 * Affiliate Analytics API Route
 * 
 * GET /api/affiliate/analytics
 * - Returns affiliate performance metrics
 * - Supports date range filtering
 * - Provides aggregated statistics
 */

import { NextRequest, NextResponse } from "next/server";

// In-memory storage references (use database in production)
// These would be shared with the track/conversion routes in a real implementation
const clickStore: Array<{
  id: string;
  timestamp: string;
  toolSlug: string;
  toolName: string;
  affiliateId: string;
  source: string;
  medium: string;
  campaign: string;
  pageUrl: string;
}> = [];

const conversionStore: Array<{
  id: string;
  timestamp: string;
  affiliateId: string;
  toolSlug: string;
  conversionType: string;
  value?: number;
  currency: string;
}> = [];

// Aggregated metrics interface
interface AffiliateMetrics {
  affiliateId: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageOrderValue: number;
  topCampaigns: Array<{ campaign: string; clicks: number; conversions: number }>;
  topTools: Array<{ toolSlug: string; clicks: number; conversions: number }>;
  dailyBreakdown: Array<{ date: string; clicks: number; conversions: number; revenue: number }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get("affiliateId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "affiliate";
    
    // Filter clicks by date range
    const filteredClicks = clickStore.filter(click => {
      const clickDate = new Date(click.timestamp);
      let include = true;
      
      if (startDate && clickDate < new Date(startDate)) include = false;
      if (endDate && clickDate > new Date(endDate)) include = false;
      if (affiliateId && click.affiliateId !== affiliateId) include = false;
      
      return include;
    });
    
    // Filter conversions by date range
    const filteredConversions = conversionStore.filter(conv => {
      const convDate = new Date(conv.timestamp);
      let include = true;
      
      if (startDate && convDate < new Date(startDate)) include = false;
      if (endDate && convDate > new Date(endDate)) include = false;
      if (affiliateId && conv.affiliateId !== affiliateId) include = false;
      
      return include;
    });
    
    // Calculate metrics based on groupBy parameter
    if (groupBy === "affiliate" && affiliateId) {
      // Return specific affiliate metrics
      const metrics = calculateAffiliateMetrics(affiliateId, filteredClicks, filteredConversions);
      return NextResponse.json(metrics);
    } else if (groupBy === "tool") {
      // Return metrics grouped by tool
      const toolMetrics = calculateToolMetrics(filteredClicks, filteredConversions);
      return NextResponse.json({
        groupBy: "tool",
        tools: toolMetrics,
        timestamp: new Date().toISOString(),
      });
    } else if (groupBy === "campaign") {
      // Return metrics grouped by campaign
      const campaignMetrics = calculateCampaignMetrics(filteredClicks, filteredConversions);
      return NextResponse.json({
        groupBy: "campaign",
        campaigns: campaignMetrics,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Return overview metrics
      const overview = calculateOverviewMetrics(filteredClicks, filteredConversions);
      return NextResponse.json({
        ...overview,
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

function calculateAffiliateMetrics(
  affiliateId: string,
  clicks: typeof clickStore,
  conversions: typeof conversionStore
): AffiliateMetrics {
  const affiliateClicks = clicks.filter(c => c.affiliateId === affiliateId);
  const affiliateConversions = conversions.filter(c => c.affiliateId === affiliateId);
  
  const totalRevenue = affiliateConversions.reduce((sum, c) => sum + (c.value || 0), 0);
  const conversionRate = affiliateClicks.length > 0 
    ? (affiliateConversions.length / affiliateClicks.length) * 100 
    : 0;
  const averageOrderValue = affiliateConversions.length > 0 
    ? totalRevenue / affiliateConversions.length 
    : 0;
  
  // Top campaigns
  const campaignMap = new Map<string, { clicks: number; conversions: number }>();
  affiliateClicks.forEach(c => {
    const existing = campaignMap.get(c.campaign || "") || { clicks: 0, conversions: 0 };
    existing.clicks++;
    campaignMap.set(c.campaign || "", existing);
  });
  affiliateConversions.forEach(c => {
    const campaign = ""; // Would need to link conversions to campaigns
    const existing = campaignMap.get(campaign) || { clicks: 0, conversions: 0 };
    existing.conversions++;
    campaignMap.set(campaign, existing);
  });
  
  const topCampaigns = Array.from(campaignMap.entries())
    .map(([campaign, data]) => ({ campaign, ...data }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
  
  // Top tools
  const toolMap = new Map<string, { clicks: number; conversions: number }>();
  affiliateClicks.forEach(c => {
    const existing = toolMap.get(c.toolSlug) || { clicks: 0, conversions: 0 };
    existing.clicks++;
    toolMap.set(c.toolSlug, existing);
  });
  affiliateConversions.forEach(c => {
    const existing = toolMap.get(c.toolSlug) || { clicks: 0, conversions: 0 };
    existing.conversions++;
    toolMap.set(c.toolSlug, existing);
  });
  
  const topTools = Array.from(toolMap.entries())
    .map(([toolSlug, data]) => ({ toolSlug, ...data }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
  
  // Daily breakdown
  const dailyMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  affiliateClicks.forEach(c => {
    const date = c.timestamp.split("T")[0];
    const existing = dailyMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.clicks++;
    dailyMap.set(date, existing);
  });
  affiliateConversions.forEach(c => {
    const date = c.timestamp.split("T")[0];
    const existing = dailyMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.conversions++;
    existing.revenue += c.value || 0;
    dailyMap.set(date, existing);
  });
  
  const dailyBreakdown = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    affiliateId,
    clicks: affiliateClicks.length,
    conversions: affiliateConversions.length,
    revenue: totalRevenue,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    topCampaigns,
    topTools,
    dailyBreakdown,
  };
}

function calculateToolMetrics(
  clicks: typeof clickStore,
  conversions: typeof conversionStore
) {
  const toolMap = new Map<string, AffiliateMetrics>();
  
  // Aggregate by tool
  clicks.forEach(c => {
    const metrics = toolMap.get(c.toolSlug) || {
      affiliateId: "all",
      clicks: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      topCampaigns: [],
      topTools: [],
      dailyBreakdown: [],
    };
    metrics.clicks++;
    toolMap.set(c.toolSlug, metrics);
  });
  
  conversions.forEach(c => {
    const metrics = toolMap.get(c.toolSlug);
    if (metrics) {
      metrics.conversions++;
      metrics.revenue += c.value || 0;
    }
  });
  
  // Calculate rates
  toolMap.forEach(metrics => {
    metrics.conversionRate = metrics.clicks > 0 
      ? Math.round((metrics.conversions / metrics.clicks) * 10000) / 100 
      : 0;
    metrics.averageOrderValue = metrics.conversions > 0 
      ? Math.round((metrics.revenue / metrics.conversions) * 100) / 100 
      : 0;
  });
  
  return Array.from(toolMap.entries())
    .map(([toolSlug, metrics]) => ({ toolSlug, ...metrics }))
    .sort((a, b) => b.clicks - a.clicks);
}

function calculateCampaignMetrics(
  clicks: typeof clickStore,
  conversions: typeof conversionStore
) {
  const campaignMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  
  clicks.forEach(c => {
    const campaign = c.campaign || "(none)";
    const existing = campaignMap.get(campaign) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.clicks++;
    campaignMap.set(campaign, existing);
  });
  
  conversions.forEach(c => {
    const campaign = ""; // Would need to link conversions to campaigns
    const existing = campaignMap.get(campaign) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.conversions++;
    existing.revenue += c.value || 0;
    campaignMap.set(campaign, existing);
  });
  
  return Array.from(campaignMap.entries())
    .map(([campaign, data]) => ({ campaign, ...data }))
    .sort((a, b) => b.clicks - a.clicks);
}

function calculateOverviewMetrics(
  clicks: typeof clickStore,
  conversions: typeof conversionStore
) {
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.value || 0), 0);
  const uniqueAffiliates = new Set(clicks.map(c => c.affiliateId)).size;
  
  // Daily trends
  const dailyMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  clicks.forEach(c => {
    const date = c.timestamp.split("T")[0];
    const existing = dailyMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.clicks++;
    dailyMap.set(date, existing);
  });
  conversions.forEach(c => {
    const date = c.timestamp.split("T")[0];
    const existing = dailyMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.conversions++;
    existing.revenue += c.value || 0;
    dailyMap.set(date, existing);
  });
  
  const trends = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Top performing affiliates
  const affiliateMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  clicks.forEach(c => {
    const existing = affiliateMap.get(c.affiliateId) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.clicks++;
    affiliateMap.set(c.affiliateId, existing);
  });
  conversions.forEach(c => {
    const existing = affiliateMap.get(c.affiliateId) || { clicks: 0, conversions: 0, revenue: 0 };
    existing.conversions++;
    existing.revenue += c.value || 0;
    affiliateMap.set(c.affiliateId, existing);
  });
  
  const topAffiliates = Array.from(affiliateMap.entries())
    .map(([affiliateId, data]) => ({ affiliateId, ...data }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
  
  return {
    totalClicks: clicks.length,
    totalConversions: conversions.length,
    totalRevenue,
    uniqueAffiliates,
    conversionRate: clicks.length > 0 
      ? Math.round((conversions.length / clicks.length) * 10000) / 100 
      : 0,
    averageOrderValue: conversions.length > 0 
      ? Math.round((totalRevenue / conversions.length) * 100) / 100 
      : 0,
    topAffiliates,
    trends,
  };
}
