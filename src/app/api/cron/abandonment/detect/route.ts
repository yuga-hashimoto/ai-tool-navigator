import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure this endpoint is not cached

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await prisma.cart.updateMany({
      where: {
        status: 'active',
        updatedAt: {
          lt: oneHourAgo,
        },
        // Ensure we only pick those that have items
        items: {
          not: '[]',
        },
      },
      data: {
        status: 'abandoned',
        recoveryStatus: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Marked ${result.count} carts as abandoned`,
    });
  } catch (error) {
    console.error('[Abandonment Detection] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
