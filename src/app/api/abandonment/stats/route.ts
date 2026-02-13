/**
 * Recovery Statistics API Route
 * 
 * GET /api/abandonment/stats
 * - Returns recovery metrics by channel
 * - Overall recovery statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  getRecoveryStats, 
  getRecoveryMetrics 
} from "@/lib/abandoned-link-recovery";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const channel = searchParams.get("channel");
    
    if (channel) {
      // Get metrics for specific channel
      const metrics = await getRecoveryMetrics(startDate, endDate);
      const channelMetrics = metrics.find(m => m.channel === channel);
      
      return NextResponse.json({
        success: true,
        data: channelMetrics || null,
      });
    }
    
    // Get overall statistics
    const stats = await getRecoveryStats();
    const channelMetrics = await getRecoveryMetrics(startDate, endDate);
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        channelBreakdown: channelMetrics,
      },
    });
    
  } catch (error) {
    console.error("[Abandonment Stats API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
