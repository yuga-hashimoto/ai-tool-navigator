import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolSlug, type } = body;

    // Get visitorId from cookie
    let visitorId: string | undefined;
    const cookies = request.cookies.getAll();

    // Find any cookie that looks like an affiliate session
    const sessionCookie = cookies.find(c => c.name.startsWith('affiliate_session'));

    if (sessionCookie) {
      visitorId = sessionCookie.value;
    } else {
      // Fallback: Check if client sent it in body (optional)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visitorId = (body as any).visitorId;
    }

    if (!visitorId) {
      // If we still don't have a visitorId, generate a temporary one
      visitorId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    if (!toolSlug || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.userInteraction.create({
      data: {
        visitorId,
        toolSlug,
        type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
