import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, slug, sessionId, userId, metadata } = body;

    if (!eventType || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, sessionId' },
        { status: 400 }
      );
    }

    let productId = null;

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (product) {
        productId = product.id;
      } else {
        console.warn(`Product not found for slug: ${slug}`);
      }
    }

    const event = await prisma.userEvent.create({
      data: {
        type: eventType,
        sessionId,
        userId,
        productId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
