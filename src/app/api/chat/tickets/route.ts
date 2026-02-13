import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';

// GET /api/chat/tickets - Get support tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const tickets = await chatService.ticket.get(status || undefined);

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST /api/chat/tickets - Create a support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chatSessionId,
      visitorId,
      visitorName,
      visitorEmail,
      category,
      priority,
      subject,
      description,
      assignedTo,
    } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    const ticket = await chatService.ticket.create({
      chatSessionId,
      visitorId,
      visitorName,
      visitorEmail,
      category,
      priority,
      subject,
      description,
      assignedTo,
    });

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
