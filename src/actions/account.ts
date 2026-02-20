'use server';

import prisma from '@/lib/prisma';
import { ensureMockUser } from '@/lib/db/user';
import { revalidatePath } from 'next/cache';
import { LOYALTY_TIERS, REWARDS, LOYALTY_CHALLENGES, getTierProgress } from '@/lib/loyalty/loyalty-core';
import type { LoyaltyTier, LoyaltyDashboardData, PointTransaction, PointTransactionType } from '@/lib/loyalty/loyalty-types';

export async function getUser() {
  return await ensureMockUser();
}

export async function getDashboardStats() {
  const user = await ensureMockUser();

  const ordersCount = await prisma.order.count({
    where: { userId: user.id }
  });

  const totalSpentAggregate = await prisma.order.aggregate({
    where: { userId: user.id, status: 'PAID' },
    _sum: { total: true }
  });

  const totalSpent = totalSpentAggregate._sum.total || 0;

  return {
    name: user.name,
    email: user.email,
    plan: user.subscription?.planId || 'FREE',
    points: user.loyaltyAccount?.points || 0,
    tier: user.loyaltyAccount?.tier || 'BRONZE',
    ordersCount,
    totalSpent
  };
}

export async function getOrders() {
  const user = await ensureMockUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return orders;
}

export async function getSubscription() {
  const user = await ensureMockUser();

  if (!user.subscription) return null;

  return {
    success: true,
    data: {
      id: user.subscription.id,
      status: user.subscription.status,
      isTrial: false,
      trialEndsAt: null,
      currentPeriodEnd: user.subscription.endDate ? user.subscription.endDate.toISOString() : null,
      cancelAtPeriodEnd: !user.subscription.autoRenew,
      tier: {
        id: user.subscription.planId,
        name: user.subscription.planId === 'PRO' ? 'Pro Plan' : 'Free Plan',
        slug: user.subscription.planId.toLowerCase(),
        price: user.subscription.planId === 'PRO' ? 29.99 : 0,
        features: user.subscription.planId === 'PRO' ? ['Unlimited Access', 'Priority Support'] : ['Basic Access']
      },
      billingHistory: []
    }
  };
}

export async function getLoyaltyData(): Promise<LoyaltyDashboardData> {
  const user = await ensureMockUser();
  const loyalty = user.loyaltyAccount;

  if (!loyalty) {
     return {
      user: {
        currentPoints: 0,
        lifetimePoints: 0,
        tier: 'BRONZE',
        tierProgress: 0,
        nextTier: 'SILVER',
        pointsToNext: 500,
        spendToNext: 100,
        lifetimeSpent: 0,
        totalPurchases: 0,
        totalReferrals: 0,
        joinDays: 0,
        achievements: 0,
        redeemableValue: 0
      },
      recentTransactions: [],
      expiringPoints: [],
      availableRewards: [],
      activeChallenges: [],
      recentAchievements: [],
      tierBenefits: {
        multiplier: 1,
        discount: 0,
        perks: []
      }
    };
  }

  const transactions = await prisma.loyaltyActivity.findMany({
    where: { loyaltyAccountId: loyalty.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const totalSpentAggregate = await prisma.order.aggregate({
    where: { userId: user.id, status: 'PAID' },
    _sum: { total: true }
  });
  const lifetimeSpent = totalSpentAggregate._sum.total || 0;

  const ordersCount = await prisma.order.count({
    where: { userId: user.id }
  });

  const currentTier = (loyalty.tier as LoyaltyTier) || 'BRONZE';
  const progress = getTierProgress(loyalty.points, lifetimeSpent, currentTier);

  const mappedTransactions: PointTransaction[] = transactions.map(t => ({
    id: t.id,
    userId: user.id,
    type: t.type as PointTransactionType,
    points: t.points,
    balanceBefore: 0,
    balanceAfter: 0,
    sourceId: null,
    sourceType: null,
    description: t.description || '',
    expiresAt: null,
    isExpiring: false,
    createdAt: t.createdAt
  }));

  // Map REWARDS to Reward[] by adding mock IDs and dates
  const availableRewards = REWARDS.map((r, i) => ({
    ...r,
    id: `reward-${i}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const activeChallenges = LOYALTY_CHALLENGES.map((c, i) => ({
    ...c,
    id: `challenge-${i}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  return {
    user: {
      currentPoints: loyalty.points,
      lifetimePoints: loyalty.lifetimePoints,
      tier: currentTier,
      tierProgress: progress.progressPercent,
      nextTier: progress.nextTier,
      pointsToNext: progress.pointsToNext,
      spendToNext: progress.spendToNext,
      lifetimeSpent,
      totalPurchases: ordersCount,
      totalReferrals: 0,
      joinDays: Math.floor((Date.now() - loyalty.joinedAt.getTime()) / (1000 * 60 * 60 * 24)),
      achievements: 0,
      redeemableValue: loyalty.points / 100
    },
    recentTransactions: mappedTransactions,
    expiringPoints: [],
    availableRewards: availableRewards,
    activeChallenges: activeChallenges,
    recentAchievements: [],
    tierBenefits: {
      multiplier: LOYALTY_TIERS[currentTier].pointsMultiplier,
      discount: LOYALTY_TIERS[currentTier].discountPercent,
      perks: LOYALTY_TIERS[currentTier].perks
    }
  };
}

export async function redeemReward(rewardId: string) {
  const user = await ensureMockUser();
  const loyalty = user.loyaltyAccount;

  if (!loyalty) throw new Error("No loyalty account");

  const mappedRewards = REWARDS.map((r, i) => ({ ...r, id: `reward-${i}` }));
  const reward = mappedRewards.find(r => r.id === rewardId || r.name === rewardId);

  if (!reward) throw new Error("Reward not found");

  if (loyalty.points < reward.pointsCost) {
    throw new Error("Insufficient points");
  }

  await prisma.loyaltyAccount.update({
    where: { id: loyalty.id },
    data: {
      points: { decrement: reward.pointsCost }
    }
  });

  await prisma.loyaltyActivity.create({
    data: {
      loyaltyAccountId: loyalty.id,
      type: 'REDEMPTION', // Need to make sure this is valid enum or string
      points: -reward.pointsCost,
      description: `Redeemed ${reward.displayName}`
    }
  });

  revalidatePath('/account/loyalty');
  return { success: true, message: 'Reward redeemed successfully!' };
}

export async function updateProfile(formData: FormData) {
  const user = await ensureMockUser();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email }
  });

  revalidatePath('/account');
  return { success: true };
}
