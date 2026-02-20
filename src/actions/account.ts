'use server';

import prisma from '@/lib/prisma';
import { MOCK_USER_ID, ensureMockUser } from '@/lib/db/user';
import { revalidatePath } from 'next/cache';

// === DASHBOARD ===
export async function getUserDashboard() {
  const user = await ensureMockUser();

  const recentOrders = await prisma.order.findMany({
    where: { userId: MOCK_USER_ID },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { items: { include: { product: true } } },
  });

  return {
    user,
    recentOrders,
  };
}

// === ORDERS ===
export async function getUserOrders(page = 1, pageSize = 10) {
  await ensureMockUser();
  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.count({ where: { userId: MOCK_USER_ID } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// === LOYALTY ===
export async function getLoyaltyData() {
  const user = await ensureMockUser();

  if (!user.loyalty) {
    throw new Error('Loyalty account not found');
  }

  const history = await prisma.pointTransaction.findMany({
    where: { loyaltyId: user.loyalty.id },
    orderBy: { createdAt: 'desc' },
  });

  const redemptions = await prisma.redemption.findMany({
    where: { loyaltyId: user.loyalty.id },
    orderBy: { createdAt: 'desc' },
  });

  return {
    loyalty: user.loyalty,
    history,
    redemptions,
  };
}

export async function redeemReward(rewardId: string, pointsCost: number) {
  const user = await ensureMockUser();

  if (!user.loyalty || user.loyalty.points < pointsCost) {
    return { success: false, error: 'Insufficient points' };
  }

  try {
    // Transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      // 1. Deduct points
      await tx.loyaltyAccount.update({
        where: { id: user.loyalty!.id },
        data: { points: { decrement: pointsCost } },
      });

      // 2. Create redemption record
      await tx.redemption.create({
        data: {
          loyaltyId: user.loyalty!.id,
          rewardId,
          pointsSpent: pointsCost,
          status: 'APPROVED',
        },
      });

      // 3. Create point transaction record (negative amount)
      await tx.pointTransaction.create({
        data: {
          loyaltyId: user.loyalty!.id,
          amount: -pointsCost,
          type: 'REDEMPTION',
          description: `Redeemed reward: ${rewardId}`,
        },
      });
    });

    try {
      revalidatePath('/account/loyalty');
    } catch (_e) {
      // Ignore revalidation error in standalone script
    }
    return { success: true };
  } catch (error) {
    console.error('Redemption failed:', error);
    return { success: false, error: 'Transaction failed' };
  }
}

// === PROFILE ===
export async function updateProfile(data: { name?: string }) {
  await ensureMockUser();

  try {
    await prisma.user.update({
      where: { id: MOCK_USER_ID },
      data,
    });

    try {
      revalidatePath('/account/preferences');
    } catch (_e) {
      // Ignore revalidation error in standalone script
    }
    return { success: true };
  } catch (_error) {
    return { success: false, error: 'Update failed' };
  }
}
