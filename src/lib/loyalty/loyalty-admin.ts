// =====================================================
// LOYALTY ADMIN API FUNCTIONS
// =====================================================

import type {
  LoyaltyUser,
  LoyaltyDashboardData,
  LeaderboardEntry,
  ReferralStats,
  PointTransaction,
  PointRedemption,
  RedemptionStatus,
  Reward,
  Achievement,
  LoyaltyChallenge,
  UserAchievement
} from './loyalty-types';

// =====================================================
// ANALYTICS & STATS
// =====================================================

export async function getLoyaltyStats(): Promise<{
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalRevenue: number;
  averageTier: string;
  topTierDistribution: Record<string, number>;
  redemptionRate: number;
  averagePointsPerMember: number;
}> {
  // This would typically call your backend API
  const response = await fetch('/api/loyalty/admin/stats');
  if (!response.ok) throw new Error('Failed to fetch loyalty stats');
  return response.json();
}

export async function getAnalytics(startDate: Date, endDate: Date): Promise<{
  pointsEarned: { date: string; amount: number }[];
  pointsRedeemed: { date: string; amount: number }[];
  newMembers: { date: string; count: number }[];
  tierUpgrades: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  topRewards: { reward: string; redemptions: number }[];
}> {
  const params = new URLSearchParams({
    start: startDate.toISOString(),
    end: endDate.toISOString()
  });
  
  const response = await fetch(`/api/loyalty/admin/analytics?${params}`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

// =====================================================
// USER MANAGEMENT
// =====================================================

export async function getAllUsers(params?: {
  page?: number;
  limit?: number;
  tier?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  users: LoyaltyUser[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.tier) searchParams.set('tier', params.tier);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  
  const response = await fetch(`/api/loyalty/admin/users?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function getUserById(userId: string): Promise<LoyaltyUser> {
  const response = await fetch(`/api/loyalty/admin/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

export async function updateUserPoints(
  userId: string,
  points: number,
  reason: string,
  type: 'add' | 'deduct' | 'set'
): Promise<PointTransaction> {
  const response = await fetch(`/api/loyalty/admin/users/${userId}/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points, reason, type })
  });
  if (!response.ok) throw new Error('Failed to update points');
  return response.json();
}

export async function adjustUserTier(
  userId: string,
  newTier: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/loyalty/admin/users/${userId}/tier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newTier, reason })
  });
  if (!response.ok) throw new Error('Failed to adjust tier');
  return response.json();
}

export async function exportUserData(userId: string): Promise<Blob> {
  const response = await fetch(`/api/loyalty/admin/users/${userId}/export`);
  if (!response.ok) throw new Error('Failed to export user data');
  return response.blob();
}

// =====================================================
// REDEMPTION MANAGEMENT
// =====================================================

export async function getRedemptionRequests(params?: {
  page?: number;
  limit?: number;
  status?: RedemptionStatus;
  userId?: string;
}): Promise<{
  redemptions: PointRedemption[];
  total: number;
  pending: number;
  completed: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.userId) searchParams.set('userId', params.userId);
  
  const response = await fetch(`/api/loyalty/admin/redemptions?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch redemptions');
  return response.json();
}

export async function approveRedemption(
  redemptionId: string,
  notes?: string
): Promise<PointRedemption> {
  const response = await fetch(`/api/loyalty/admin/redemptions/${redemptionId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  if (!response.ok) throw new Error('Failed to approve redemption');
  return response.json();
}

export async function rejectRedemption(
  redemptionId: string,
  reason: string
): Promise<PointRedemption> {
  const response = await fetch(`/api/loyalty/admin/redemptions/${redemptionId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!response.ok) throw new Error('Failed to reject redemption');
  return response.json();
}

export async function createRedemption(
  userId: string,
  rewardId: string
): Promise<PointRedemption> {
  const response = await fetch('/api/loyalty/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, rewardId })
  });
  if (!response.ok) throw new Error('Failed to create redemption');
  return response.json();
}

export async function processRedemption(
  redemptionId: string,
  action: 'complete' | 'cancel',
  notes?: string
): Promise<PointRedemption> {
  const response = await fetch(`/api/loyalty/admin/redemptions/${redemptionId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, notes })
  });
  if (!response.ok) throw new Error('Failed to process redemption');
  return response.json();
}

// =====================================================
// REWARD MANAGEMENT
// =====================================================

export async function getAllRewards(): Promise<Reward[]> {
  const response = await fetch('/api/loyalty/admin/rewards');
  if (!response.ok) throw new Error('Failed to fetch rewards');
  return response.json();
}

export async function createReward(reward: Partial<Reward>): Promise<Reward> {
  const response = await fetch('/api/loyalty/admin/rewards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reward)
  });
  if (!response.ok) throw new Error('Failed to create reward');
  return response.json();
}

export async function updateReward(rewardId: string, updates: Partial<Reward>): Promise<Reward> {
  const response = await fetch(`/api/loyalty/admin/rewards/${rewardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update reward');
  return response.json();
}

export async function deleteReward(rewardId: string): Promise<void> {
  const response = await fetch(`/api/loyalty/admin/rewards/${rewardId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete reward');
}

export async function toggleRewardActive(rewardId: string): Promise<Reward> {
  const response = await fetch(`/api/loyalty/admin/rewards/${rewardId}/toggle`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to toggle reward');
  return response.json();
}

// =====================================================
// ACHIEVEMENT MANAGEMENT
// =====================================================

export async function getAllAchievements(): Promise<Achievement[]> {
  const response = await fetch('/api/loyalty/admin/achievements');
  if (!response.ok) throw new Error('Failed to fetch achievements');
  return response.json();
}

export async function createAchievement(achievement: Partial<Achievement>): Promise<Achievement> {
  const response = await fetch('/api/loyalty/admin/achievements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(achievement)
  });
  if (!response.ok) throw new Error('Failed to create achievement');
  return response.json();
}

export async function updateAchievement(
  achievementId: string,
  updates: Partial<Achievement>
): Promise<Achievement> {
  const response = await fetch(`/api/loyalty/admin/achievements/${achievementId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update achievement');
  return response.json();
}

export async function awardAchievement(
  userId: string,
  achievementCode: string
): Promise<UserAchievement> {
  const response = await fetch('/api/loyalty/admin/achievements/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, achievementCode })
  });
  if (!response.ok) throw new Error('Failed to award achievement');
  return response.json();
}

// =====================================================
// CHALLENGE MANAGEMENT
// =====================================================

export async function getAllChallenges(): Promise<LoyaltyChallenge[]> {
  const response = await fetch('/api/loyalty/admin/challenges');
  if (!response.ok) throw new Error('Failed to fetch challenges');
  return response.json();
}

export async function createChallenge(challenge: Partial<LoyaltyChallenge>): Promise<LoyaltyChallenge> {
  const response = await fetch('/api/loyalty/admin/challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(challenge)
  });
  if (!response.ok) throw new Error('Failed to create challenge');
  return response.json();
}

export async function updateChallenge(
  challengeId: string,
  updates: Partial<LoyaltyChallenge>
): Promise<LoyaltyChallenge> {
  const response = await fetch(`/api/loyalty/admin/challenges/${challengeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update challenge');
  return response.json();
}

export async function endChallenge(challengeId: string): Promise<LoyaltyChallenge> {
  const response = await fetch(`/api/loyalty/admin/challenges/${challengeId}/end`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to end challenge');
  return response.json();
}

// =====================================================
// LEADERBOARD
// =====================================================

export async function getLeaderboard(params?: {
  limit?: number;
  period?: 'week' | 'month' | 'all';
  type?: 'points' | 'spend' | 'referrals';
}): Promise<LeaderboardEntry[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.period) searchParams.set('period', params.period);
  if (params?.type) searchParams.set('type', params.type);
  
  const response = await fetch(`/api/loyalty/leaderboard?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}

// =====================================================
// REFERRAL ANALYTICS
// =====================================================

export async function getReferralStats(userId?: string): Promise<ReferralStats & {
  referralCode: string;
  recentReferrals: { id: string; email: string; status: string; date: Date; pointsEarned: number }[];
}> {
  const params = userId ? `?userId=${userId}` : '';
  const response = await fetch(`/api/loyalty/referral/stats${params}`);
  if (!response.ok) throw new Error('Failed to fetch referral stats');
  return response.json();
}

// =====================================================
// BULK OPERATIONS
// =====================================================

export async function bulkAwardPoints(
  userIds: string[],
  points: number,
  reason: string
): Promise<{ success: number; failed: number }> {
  const response = await fetch('/api/loyalty/admin/bulk/award-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds, points, reason })
  });
  if (!response.ok) throw new Error('Failed to bulk award points');
  return response.json();
}

export async function runTierRecalculation(): Promise<{
  upgraded: number;
  downgraded: number;
  unchanged: number;
}> {
  const response = await fetch('/api/loyalty/admin/recalculate-tiers', {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to run tier recalculation');
  return response.json();
}

export async function runPointExpiration(): Promise<{
  expired: number;
  pointsExpired: number;
}> {
  const response = await fetch('/api/loyalty/admin/expire-points', {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to run point expiration');
  return response.json();
}
