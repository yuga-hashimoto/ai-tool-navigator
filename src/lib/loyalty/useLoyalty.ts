// =====================================================
// useLoyalty Hook - React hook for loyalty system integration
// =====================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LoyaltyTier, PointTransaction, Reward, UserAchievement, LoyaltyChallenge, LeaderboardEntry } from './loyalty-types';

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

const LOYALTY_API_BASE = '/api/loyalty';

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
      
      const response = await fetch(`${LOYALTY_API_BASE}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch loyalty data');
      
      const data = await response.json();
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

  const addPoints = async (points: number, reason: string): Promise<boolean> => {
    try {
      const response = await fetch(`${LOYALTY_API_BASE}/points/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, reason })
      });
      
      if (!response.ok) throw new Error('Failed to add points');
      
      await fetchLoyaltyData();
      return true;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  };

  const redeemReward = async (rewardId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${LOYALTY_API_BASE}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to redeem reward');
      
      await fetchLoyaltyData();
      return { success: true, message: 'Reward redeemed successfully!' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message };
    }
  };

  const joinChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${LOYALTY_API_BASE}/challenges/${challengeId}/join`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to join challenge');
      
      await fetchLoyaltyData();
      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  };

  const claimBirthdayBonus = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${LOYALTY_API_BASE}/birthday/claim`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to claim birthday bonus');
      
      await fetchLoyaltyData();
      return true;
    } catch (error) {
      console.error('Error claiming birthday bonus:', error);
      return false;
    }
  };

  const shareReferralCode = async (platform: string): Promise<void> => {
    try {
      await fetch(`${LOYALTY_API_BASE}/referral/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
    } catch (error) {
      console.error('Error sharing referral code:', error);
    }
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

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('dailyLogin');
    if (saved) {
      const data = JSON.parse(saved);
      setStreak(data.streak || 0);
      setLastLogin(data.lastLogin ? new Date(data.lastLogin) : null);
    }
    
    // Check if can claim today
    checkDailyClaim();
  }, []);

  const checkDailyClaim = useCallback(async () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('dailyLogin');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.lastLogin === today) {
        setCanClaim(false);
      } else {
        // Check if streak is still valid (logged in yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (data.lastLogin === yesterday.toDateString()) {
          setCanClaim(true);
        } else if (!data.lastLogin || data.lastLogin !== today) {
          // Broken streak, but can still claim
          setCanClaim(true);
        }
      }
    } else {
      setCanClaim(true);
    }
  }, []);

  const claimDailyPoints = useCallback(async (points: number): Promise<boolean> => {
    try {
      const response = await fetch(`${LOYALTY_API_BASE}/daily-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      });
      
      if (!response.ok) throw new Error('Failed to claim daily points');
      
      const today = new Date().toDateString();
      let newStreak = streak;
      
      if (lastLogin) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLogin.toDateString() === yesterday.toDateString()) {
          newStreak = streak + 1;
        } else if (lastLogin.toDateString() !== today) {
          newStreak = 1; // Reset streak
        }
      } else {
        newStreak = 1;
      }
      
      setStreak(newStreak);
      setLastLogin(new Date());
      setCanClaim(false);
      
      // Save to localStorage
      localStorage.setItem('dailyLogin', JSON.stringify({
        streak: newStreak,
        lastLogin: today
      }));
      
      return true;
    } catch (error) {
      console.error('Error claiming daily points:', error);
      return false;
    }
  }, [streak, lastLogin]);

  return { streak, lastLogin, canClaim, claimDailyPoints };
}

// Hook for leaderboard
export function useLeaderboard(limit: number = 10) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${LOYALTY_API_BASE}/leaderboard?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, isLoading, error, refresh: fetchLeaderboard };
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${LOYALTY_API_BASE}/referral/stats`);
      if (!response.ok) throw new Error('Failed to fetch referral data');
      
      const data = await response.json();
      setReferralCode(data.referralCode);
      setReferralStats(data.stats);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const shareCode = useCallback(async (platform: 'email' | 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
    if (!referralCode) return;
    
    const shareUrl = `${window.location.origin}/join?ref=${referralCode}`;
    const message = `Join me and get ${process.env.NEXT_PUBLIC_REFERRAL_BONUS || 100} bonus points! Use my code: ${referralCode}`;
    
    switch (platform) {
      case 'email':
        window.location.href = `mailto:?subject=Join me on AI Tool Navigator&body=${encodeURIComponent(message + '\n\n' + shareUrl)}`;
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(`${message}\n\n${shareUrl}`);
        break;
    }
    
    // Track share
    await fetch(`${LOYALTY_API_BASE}/referral/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform })
    });
  }, [referralCode]);

  const generateNewCode = useCallback(async () => {
    try {
      const response = await fetch(`${LOYALTY_API_BASE}/referral/generate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate referral code');
      
      const data = await response.json();
      setReferralCode(data.referralCode);
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  }, []);

  return {
    referralCode,
    referralStats,
    isLoading,
    shareCode,
    generateNewCode,
    refresh: fetchReferralData
  };
}
