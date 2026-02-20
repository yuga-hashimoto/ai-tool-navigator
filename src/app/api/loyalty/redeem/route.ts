
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { REWARDS } from '@/lib/loyalty/loyalty-core';

export async function POST(request: NextRequest) {
  try {
    const { rewardId } = await request.json(); // rewardId is the `name` field in REWARDS
    const userId = 'mock-user-id'; // Mock user

    const account = await prisma.loyaltyAccount.findUnique({
      where: { userId }
    });

    if (!account) {
      return NextResponse.json({ error: 'Loyalty account not found' }, { status: 404 });
    }

    const reward = REWARDS.find(r => r.name === rewardId);
    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    if (account.currentPoints < reward.pointsCost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Deduct points
    await prisma.loyaltyAccount.update({
      where: { userId },
      data: {
        currentPoints: { decrement: reward.pointsCost },
        lastActivity: new Date()
      }
    });

    // Record transaction
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        points: -reward.pointsCost,
        type: 'REDEEM',
        description: `Redeemed: ${reward.displayName}`
      }
    });

    // Add user reward
    await prisma.userReward.create({
      data: {
        accountId: account.id,
        rewardId: reward.name,
        name: reward.displayName,
        code: reward.code || 'GENERATED-CODE-' + Date.now(),
        status: 'ACTIVE',
        expiresAt: reward.validDays ? new Date(Date.now() + reward.validDays * 24 * 60 * 60 * 1000) : null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 });
  }
}
