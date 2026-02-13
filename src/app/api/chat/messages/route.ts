import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';

// GET /api/chat/messages - Get messages for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const messages = await chatService.message.get(sessionId);

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages - Add a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chatSessionId,
      senderType,
      senderId,
      content,
      contentType,
      metadata,
    } = body;

    if (!chatSessionId || !content) {
      return NextResponse.json(
        { success: false, error: 'Session ID and content are required' },
        { status: 400 }
      );
    }

    const message = await chatService.message.add({
      chatSessionId,
      senderType,
      senderId,
      content,
      contentType,
      metadata,
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/messages - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, senderType } = body;

    if (!sessionId || !senderType) {
      return NextResponse.json(
        { success: false, error: 'Session ID and sender type are required' },
        { status: 400 }
      );
    }

    const result = await chatService.message.markAsRead(sessionId, senderType);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
