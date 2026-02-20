// =====================================================
// useLoyalty Hook - React hook for loyalty system integration
// =====================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LoyaltyTier, PointTransaction, Reward, UserAchievement, LoyaltyChallenge, LeaderboardEntry } from './loyalty-types';
import { getLoyaltyData, redeemReward as redeemRewardAction } from '@/actions/account';

interface LoyaltyUserData {
  currentPoints: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  tierProgress: number;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  spendToNext: number;
  lifetimeSpent: number;
  totalPurchases: number;
  totalReferrals: number;
  joinDays: number;
  achievements: number;
  redeemableValue: number;
  birthdayBonus: number;
  tierBenefits: {
    multiplier: number;
    discount: number;
    perks: string[];
  };
}

interface ExpiringPoints {
  expiringPoints: number;
  expirationDate: Date;
}

interface LoyaltyState {
  user: LoyaltyUserData | null;
  transactions: PointTransaction[];
  expiringPoints: ExpiringPoints[];
  availableRewards: Reward[];
  activeChallenges: LoyaltyChallenge[];
  recentAchievements: UserAchievement[];
  isLoading: boolean;
  error: string | null;
}

interface UseLoyaltyReturn extends LoyaltyState {
  // Actions
  refreshUserData: () => Promise<void>;
  addPoints: (points: number, reason: string) => Promise<boolean>;
  redeemReward: (rewardId: string) => Promise<{ success: boolean; message: string }>;
  joinChallenge: (challengeId: string) => Promise<boolean>;
  claimBirthdayBonus: () => Promise<boolean>;
  shareReferralCode: (platform: string) => Promise<void>;
  
  // Computed
  canRedeem: boolean;
  tierProgress: number;
  pointsPerDollar: number;
}

export function useLoyalty(): UseLoyaltyReturn {
  const [state, setState] = useState<LoyaltyState>({
    user: null,
    transactions: [],
    expiringPoints: [],
    availableRewards: [],
    activeChallenges: [],
    recentAchievements: [],
    isLoading: true,
    error: null
  });

  const fetchLoyaltyData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data = await getLoyaltyData();
      
      setState({
        user: data.user,
        transactions: data.recentTransactions || [],
        expiringPoints: data.expiringPoints || [],
        availableRewards: data.availableRewards || [],
        activeChallenges: data.activeChallenges || [],
        recentAchievements: data.recentAchievements || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, []);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const addPoints = async (_points: number, _reason: string): Promise<boolean> => {
    // Placeholder
    return false;
  };

  const redeemReward = async (rewardId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await redeemRewardAction(rewardId);
      
      await fetchLoyaltyData();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message };
    }
  };

  const joinChallenge = async (_challengeId: string): Promise<boolean> => {
    // Placeholder
    return false;
  };

  const claimBirthdayBonus = async (): Promise<boolean> => {
    // Placeholder
    return false;
  };

  const shareReferralCode = async (_platform: string): Promise<void> => {
    // Placeholder
  };

  // Computed values
  const canRedeem = state.user ? state.availableRewards.some(
    reward => state.user!.currentPoints >= reward.pointsCost
  ) : false;

  const tierProgress = state.user?.tierProgress ?? 0;
  const pointsPerDollar = state.user ? Math.round(10 * state.user.tierBenefits.multiplier) : 10;

  return {
    ...state,
    refreshUserData: fetchLoyaltyData,
    addPoints,
    redeemReward,
    joinChallenge,
    claimBirthdayBonus,
    shareReferralCode,
    canRedeem,
    tierProgress,
    pointsPerDollar
  };
}

// Hook for tracking daily login streak
export function useDailyLogin() {
  const [streak, setStreak] = useState(0);
  const [lastLogin, setLastLogin] = useState<Date | null>(null);
  const [canClaim, setCanClaim] = useState(false);

  // Placeholder implementation to avoid errors
  const claimDailyPoints = useCallback(async (_points: number): Promise<boolean> => {
    return false;
  }, []);

  return { streak, lastLogin, canClaim, claimDailyPoints };
}

// Hook for leaderboard
export function useLeaderboard(limit: number = 10) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Set false to stop loading spinner
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {}, []);

  return { entries, isLoading, error, refresh };
}

// Hook for referral program
export function useReferralProgram() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    totalPointsEarned: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const shareCode = useCallback(async (platform: string) => {}, []);
  const generateNewCode = useCallback(async () => {}, []);
  const refresh = useCallback(async () => {}, []);

  return {
    referralCode,
    referralStats,
    isLoading,
    shareCode,
    generateNewCode,
    refresh
  };
}
