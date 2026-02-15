import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, eventType, productSlug, metadata } = await req.json();

    if (!sessionId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let product = null;

    if (productSlug) {
      product = await prisma.product.findUnique({
        where: { slug: productSlug },
      });
    }

    const event = await prisma.userEvent.create({
      data: {
        sessionId,
        eventType,
        productId: product ? product.id : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
