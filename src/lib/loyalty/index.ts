// =====================================================
// LOYALTY INDEX - Export all loyalty-related functionality
// =====================================================

export * from './loyalty-types';
export * from './loyalty-core';

// Admin API functions
export {
  getLoyaltyStats,
  getAllUsers,
  getUserById,
  updateUserPoints,
  adjustUserTier,
  processRedemption,
  getRedemptionRequests,
  approveRedemption,
  rejectRedemption,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getAllAchievements,
  createAchievement,
  updateAchievement,
  getAllChallenges,
  createChallenge,
  updateChallenge,
  getLeaderboard,
  exportUserData,
  getAnalytics
} from './loyalty-admin';

// React hooks
export { useLoyalty } from './useLoyalty';
export { useLoyaltyRewards } from './useLoyaltyRewards';
