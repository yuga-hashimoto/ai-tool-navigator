import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';
import prisma from '@/lib/prisma';

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

// POST /api/chat/triggers - Create a proactive trigger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, triggerType, conditions, message, isActive } = body;

    if (!name || !triggerType || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, trigger type, and message are required' },
        { status: 400 }
      );
    }

    // @ts-ignore - The underlying service might be using prisma directly, but the service definition is incomplete in the type system
    const trigger = await prisma.proactiveTrigger.create({
      data: {
        name,
        triggerType,
        conditions: JSON.stringify(conditions || {}),
        message,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json({ success: true, data: trigger }, { status: 201 });
  } catch (error) {
    console.error('Error creating trigger:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trigger' },
      { status: 500 }
    );
  }
}
