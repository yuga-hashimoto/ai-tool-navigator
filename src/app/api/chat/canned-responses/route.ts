import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chat-service';

// GET /api/chat/canned-responses - Get canned responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let responses;

    if (search) {
      responses = await chatService.cannedResponse.search(search);
    } else {
      responses = await chatService.cannedResponse.get(category || undefined);
    }

    return NextResponse.json({ success: true, data: responses });
  } catch (error) {
    console.error('Error fetching canned responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch canned responses' },
      { status: 500 }
    );
  }
}

// POST /api/chat/canned-responses - Create a canned response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, keywords } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Use Prisma directly for canned responses
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const response = await prisma.cannedResponse.create({
      data: {
        title,
        content,
        category: category || 'GENERAL',
        keywords,
      },
    });

    return NextResponse.json({ success: true, data: response }, { status: 201 });
  } catch (error) {
    console.error('Error creating canned response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create canned response' },
      { status: 500 }
    );
  }
}
