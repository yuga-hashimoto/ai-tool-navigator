import { useState, useEffect } from 'react';
import { Reward } from './loyalty-types';
import { REWARDS } from './loyalty-core';

export function useLoyaltyRewards() {
  const [rewards, setRewards] = useState<Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>[]>(REWARDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeemReward = async (rewardId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock redemption logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Redeemed reward: ${rewardId}`);
      return true;
    } catch (err) {
      setError('Failed to redeem reward');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    rewards,
    loading,
    error,
    redeemReward
  };
}
