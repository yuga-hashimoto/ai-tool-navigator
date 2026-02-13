// Scheduler API Route
// Endpoint for cron job triggers

import { NextRequest, NextResponse } from 'next/server';
import { 
  processReminders, 
  processExpiredTrials, 
  recordAnalytics,
  runScheduledTasks,
} from '@/lib/subscriptions/scheduler';

// Disable body parsing for cron routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const task = searchParams.get('task') || 'all';
  
  try {
    switch (task) {
      case 'reminders':
        await processReminders();
        break;
        
      case 'trials':
        await processExpiredTrials();
        break;
        
      case 'analytics':
        await recordAnalytics();
        break;
        
      case 'all':
      default:
        await runScheduledTasks();
        break;
    }
    
    return NextResponse.json({
      success: true,
      task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Scheduler error (${task}):`, error);
    return NextResponse.json(
      { success: false, error: 'Task execution failed' },
      { status: 500 }
    );
  }
}

// Also support POST for some cron providers
export async function POST(request: NextRequest) {
  return GET(request);
}
