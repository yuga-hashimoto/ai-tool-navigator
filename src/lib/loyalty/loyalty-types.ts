// =====================================================
// LOYALTY TYPES
// =====================================================

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export type PointTransactionType =
  | 'PURCHASE'
  | 'PURCHASE_BONUS'
  | 'DAILY_LOGIN'
  | 'REFERRAL_SIGNUP'
  | 'REFERRAL_PURCHASE'
  | 'BIRTHDAY_BONUS'
  | 'TIER_BONUS'
  | 'FIRST_PURCHASE'
  | 'REVIEW'
  | 'SOCIAL_SHARE'
  | 'PROFILE_COMPLETE'
  | 'EVENT_BONUS'
  | 'EXPIRATION'
  | 'MANUAL_ADJUSTMENT'
  | 'GAMIFICATION';

export type RedemptionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type RewardCategory =
  | 'discount'
  | 'gift_card'
  | 'merchandise'
  | 'experience'
  | 'exclusive';

export type AchievementCategory =
  | 'purchases'
  | 'engagement'
  | 'social'
  | 'milestones'
  | 'special';

export type ChallengeCategory =
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'special';

export type FlagType =
  | 'vip'
  | 'ambassador'
  | 'early_adopter'
  | 'lifetime'
  | 'special';

// =====================================================
// LOYALTY USER
// =====================================================

export interface LoyaltyUser {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  currentPoints: number;
  lifetimePoints: number;
  lifetimeSpent: number;
  totalPurchases: number;
  tier: LoyaltyTier;
  tierProgress: number;
  joinDate: Date;
  lastActivityDate: Date;
  birthday: Date | null;
  referralCode: string;
  referredBy: string | null;
  totalReferrals: number;
  referralEarnings: number;
  totalReferralPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  pointTransactions?: PointTransaction[];
  pointRedemptions?: PointRedemption[];
  tierHistory?: TierHistory[];
  achievements?: UserAchievement[];
  loyaltyFlags?: LoyaltyFlag[];
}

// =====================================================
// LOYALTY TIER
// =====================================================

export interface LoyaltyTierDefinition {
  id: string;
  name: string;
  displayName: string;
  minPoints: number;
  minSpend: number;
  pointsMultiplier: number;
  discountPercent: number;
  exclusiveBenefits: string | null;
  color: string;
  icon: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// POINT TRANSACTION
// =====================================================

export interface PointTransaction {
  id: string;
  userId: string;
  type: PointTransactionType;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  sourceId: string | null;
  sourceType: string | null;
  description: string;
  expiresAt: Date | null;
  isExpiring: boolean;
  createdAt: Date;
  user?: LoyaltyUser;
}

// =====================================================
// POINT RULE
// =====================================================

export interface PointRule {
  id: string;
  name: string;
  displayName: string;
  type: string;
  points: number;
  pointsPerDollar: number | null;
  maxPoints: number | null;
  dailyLimit: number | null;
  tierMultipliers: string | null;
  isActive: boolean;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// REDEMPTION & REWARD
// =====================================================

export interface PointRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  pointsCost: number;
  status: RedemptionStatus;
  value: number;
  currency: string;
  code: string | null;
  codeUsed: boolean;
  redemptionUrl: string | null;
  expiresAt: Date | null;
  processedAt: Date | null;
  notes: string | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: LoyaltyUser;
  reward?: Reward;
}

export interface Reward {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;
  monetaryValue: number;
  currency: string;
  discountType: string | null;
  discountValue: number | null;
  code: string | null;
  maxRedemptions: number | null;
  redemptionsRemaining: number | null;
  perUserLimit: number | null;
  validDays: number | null;
  tierRequirement: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  redemptions?: PointRedemption[];
}

// =====================================================
// ACHIEVEMENTS
// =====================================================

export interface Achievement {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description: string;
  category: AchievementCategory;
  pointsReward: number;
  badgeIcon: string | null;
  badgeColor: string | null;
  tierRequirement: string | null;
  requirement: string;
  isHidden: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userAchievements?: UserAchievement[];
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  target: number;
  percentComplete: number;
  isCompleted: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
  claimedPoints: number;
  createdAt: Date;
  updatedAt: Date;
  user?: LoyaltyUser;
  achievement?: Achievement;
}

// =====================================================
// TIER HISTORY
// =====================================================

export interface TierHistory {
  id: string;
  userId: string;
  previousTier: LoyaltyTier;
  newTier: LoyaltyTier;
  reason: string;
  pointsAtChange: number;
  spendAtChange: number;
  createdAt: Date;
  user?: LoyaltyUser;
}

// =====================================================
// LOYALTY FLAGS
// =====================================================

export interface LoyaltyFlag {
  id: string;
  userId: string;
  flagType: FlagType;
  description: string;
  isActive: boolean;
  grantedAt: Date;
  expiresAt: Date | null;
  grantedBy: string | null;
  createdAt: Date;
  user?: LoyaltyUser;
}

// =====================================================
// CHALLENGES
// =====================================================

export interface LoyaltyChallenge {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ChallengeCategory;
  type: string;
  target: number;
  currentProgress: number;
  pointsReward: number;
  bonusReward: number | null;
  tierRequirement: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isGlobal: boolean;
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  progress: number;
  rank: number | null;
  isCompleted: boolean;
  completedAt: Date | null;
  claimedBonus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// SETTINGS
// =====================================================

export interface LoyaltySettings {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface LoyaltyDashboardData {
  user: {
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
  };
  recentTransactions: PointTransaction[];
  expiringPoints: { expiringPoints: number; expirationDate: Date }[];
  availableRewards: Reward[];
  activeChallenges: LoyaltyChallenge[];
  recentAchievements: UserAchievement[];
  tierBenefits: {
    multiplier: number;
    discount: number;
    perks: string[];
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  tier: LoyaltyTier;
  points: number;
  totalSpend: number;
  referralCount: number;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  totalPointsEarned: number;
  conversionRate: number;
}
