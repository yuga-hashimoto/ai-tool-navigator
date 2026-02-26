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
  createRedemption,
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
export { useLoyaltyPoints } from './useLoyaltyPoints';
export { useLoyaltyRewards } from './useLoyaltyRewards';
export { useLoyaltyAchievements } from './useLoyaltyAchievements';
export { useReferralProgram } from './useReferralProgram';
