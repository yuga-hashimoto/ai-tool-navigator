
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LOYALTY_TIERS, getTierProgress, REWARDS, LOYALTY_CHALLENGES } from '@/lib/loyalty/loyalty-core';

export async function GET(request: NextRequest) {
  try {
    // Mock user session
    // In a real app, this would come from next-auth session
    const userId = 'mock-user-id';

    // Ensure user exists (for development/testing)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Create with try-catch in case of race condition or parallel requests
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: 'mock@example.com',
            name: 'Demo User',
          }
        });
      } catch (e) {
        user = await prisma.user.findUnique({ where: { id: userId } });
      }
    }

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create loyalty account
    let loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        rewards: true,
        achievements: true,
        challenges: true
      }
    });

    if (!loyaltyAccount) {
      loyaltyAccount = await prisma.loyaltyAccount.create({
        data: {
          userId,
          currentPoints: 100, // Starting bonus
          lifetimePoints: 100,
          joinDate: new Date(),
          tier: 'BRONZE'
        },
        include: {
          transactions: true,
          rewards: true,
          achievements: true,
          challenges: true
        }
      });

      // Record initial transaction
      await prisma.loyaltyTransaction.create({
        data: {
            accountId: loyaltyAccount.id,
            points: 100,
            type: 'EARN',
            description: 'Welcome Bonus'
        }
      });
    }

    const tierConfig = LOYALTY_TIERS[loyaltyAccount.tier as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.BRONZE;
    const { nextTier, pointsToNext, spendToNext, progressPercent } = getTierProgress(
      loyaltyAccount.currentPoints,
      loyaltyAccount.totalSpent,
      loyaltyAccount.tier as any
    );

    const userData = {
      currentPoints: loyaltyAccount.currentPoints,
      lifetimePoints: loyaltyAccount.lifetimePoints,
      tier: loyaltyAccount.tier,
      tierProgress: progressPercent,
      nextTier,
      pointsToNext,
      spendToNext,
      lifetimeSpent: loyaltyAccount.totalSpent,
      totalPurchases: await prisma.order.count({ where: { userId } }),
      // Fix: referralCode might be null, handle count accordingly
      totalReferrals: loyaltyAccount.referralCode ? await prisma.loyaltyAccount.count({ where: { referredBy: loyaltyAccount.referralCode } }) : 0,
      joinDays: Math.floor((Date.now() - new Date(loyaltyAccount.joinDate).getTime()) / (1000 * 60 * 60 * 24)),
      achievements: loyaltyAccount.achievements.length,
      redeemableValue: (loyaltyAccount.currentPoints / 100), // Assuming 1 point = $0.01
      birthdayBonus: 0,
      tierBenefits: {
        multiplier: tierConfig.pointsMultiplier,
        discount: tierConfig.discountPercent,
        perks: tierConfig.benefits
      }
    };

    return NextResponse.json({
      user: userData,
      recentTransactions: loyaltyAccount.transactions,
      expiringPoints: [], // TODO: Implement expiration logic
      availableRewards: REWARDS,
      activeChallenges: LOYALTY_CHALLENGES,
      recentAchievements: loyaltyAccount.achievements
    });
  } catch (error) {
    console.error('Error fetching loyalty dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
}
