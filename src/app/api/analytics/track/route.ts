import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, type, sessionId, metadata } = body;

    if (!productId || !type || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields: productId, type, sessionId' }, { status: 400 });
    }

    // Attempt to find product by slug first (common use case)
    let product = await prisma.product.findUnique({
      where: { slug: productId },
    });

    // If not found by slug, try by ID
    if (!product) {
        product = await prisma.product.findUnique({
            where: { id: productId },
        });
    }

    if (!product) {
      return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 404 });
    }

    const interaction = await prisma.userInteraction.create({
      data: {
        sessionId,
        productId: product.id,
        type,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    return NextResponse.json({ success: true, id: interaction.id });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
