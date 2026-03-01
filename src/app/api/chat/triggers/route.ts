import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';

// GET /api/chat/triggers - Get active proactive triggers
export async function GET(request: NextRequest) {
  try {
    const triggers = await chatService.proactiveTrigger.getActive();
    return NextResponse.json({ success: true, data: triggers });
  } catch (error) {
    console.error('Error fetching triggers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch triggers' },
      { status: 500 }
    );
  }
}

// POST disabled - proactiveTrigger.create not implemented in chat-service.ts
// TODO: Implement create method in chat-service.ts
