import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';

// GET /api/chat/analytics - Get chat analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date();

    const analytics = await chatService.analytics.get(startDate, endDate);

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching chat analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
