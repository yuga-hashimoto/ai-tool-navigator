import { detectChurnedUsers, processWinBackCampaigns } from '@/lib/win-back';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Simple protection with a secret key
  // In development, we can skip this check or use a default secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const churnResult = await detectChurnedUsers();
    const campaignResult = await processWinBackCampaigns();

    return NextResponse.json({
      success: true,
      churnedUsers: churnResult,
      processedCampaigns: campaignResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Win-back cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
