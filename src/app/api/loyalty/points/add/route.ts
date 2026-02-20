
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { points, reason } = await request.json();

    // Mock user
    const userId = 'mock-user-id';

    const account = await prisma.loyaltyAccount.findUnique({
      where: { userId }
    });

    if (!account) {
      return NextResponse.json({ error: 'Loyalty account not found' }, { status: 404 });
    }

    // Update account
    await prisma.loyaltyAccount.update({
      where: { userId },
      data: {
        currentPoints: { increment: points },
        lifetimePoints: { increment: points },
        lastActivity: new Date()
      }
    });

    // Record transaction
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        points,
        type: 'EARN',
        description: reason || 'Points added'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: 'Failed to add points' }, { status: 500 });
  }
}
