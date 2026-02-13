// GET /api/subscriptions/analytics
// Get subscription analytics

import { NextRequest, NextResponse } from 'next/server';
import { 
  getSubscriptionAnalytics, 
  getMRRHistory, 
  getRevenueByTier,
  recordDailyAnalytics,
} from '@/lib/subscriptions/subscription-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'current';
    const days = parseInt(searchParams.get('days') || '30');
    
    switch (type) {
      case 'current': {
        const analytics = await getSubscriptionAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics,
        });
      }
      
      case 'history': {
        const history = await getMRRHistory(days);
        return NextResponse.json({
          success: true,
          data: history,
        });
      }
      
      case 'byTier': {
        const revenueByTier = await getRevenueByTier();
        return NextResponse.json({
          success: true,
          data: revenueByTier,
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions/analytics
// Record daily analytics (called by scheduler)

export async function POST() {
  try {
    const analytics = await recordDailyAnalytics();
    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}
