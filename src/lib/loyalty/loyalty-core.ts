// =====================================================
// LOYALTY POINTS & REWARD SYSTEM CORE LIBRARY
// =====================================================
// Comprehensive loyalty program with points, tiers, gamification,
// birthday bonuses, referral rewards, and redemption options

import type {
  LoyaltyUser,
  LoyaltyTier,
  PointTransaction,
  PointTransactionType,
  PointRule,
  Reward,
  PointRedemption,
  RedemptionStatus,
  Achievement,
  UserAchievement,
  LoyaltyChallenge,
  LoyaltyFlag,
  TierHistory,
  LoyaltySettings
} from './loyalty-types';

// =====================================================
// LOYALTY TIER CONFIGURATIONS
// =====================================================

export const LOYALTY_TIERS: Record<LoyaltyTier, {
  displayName: string;
  minPoints: number;
  minSpend: number;
  pointsMultiplier: number;
  discountPercent: number;
  benefits: string[];
  color: string;
  icon: string;
  perks: string[];
}> = {
  BRONZE: {
    displayName: 'Bronze',
    minPoints: 0,
    minSpend: 0,
    pointsMultiplier: 1.0,
    discountPercent: 0,
    benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points', 'Member-only rewards'],
    color: '#CD7F32',
    icon: '🥉',
    perks: ['Basic point earning', 'Birthday bonus', 'Access to bronze rewards']
  },
  SILVER: {
    displayName: 'Silver',
    minPoints: 500,
    minSpend: 100,
    pointsMultiplier: 1.25,
    discountPercent: 5,
    benefits: ['Earn 1.25x points per $1', '5% discount on purchases', 'Early access to sales', 'Priority support'],
    color: '#C0C0C0',
    icon: '🥈',
    perks: ['1.25x point multiplier', '5% purchase discount', 'Priority email support', 'Early sale access']
  },
  GOLD: {
    displayName: 'Gold',
    minPoints: 2000,
    minSpend: 500,
    pointsMultiplier: 1.5,
    discountPercent: 10,
    benefits: ['Earn 1.5x points per $1', '10% discount on purchases', 'Free expedited shipping', 'Exclusive Gold rewards', 'Dedicated support'],
    color: '#FFD700',
    icon: '🥇',
    perks: ['1.5x point multiplier', '10% purchase discount', 'Free expedited shipping', 'Gold-tier rewards', 'Priority support']
  },
  PLATINUM: {
    displayName: 'Platinum',
    minPoints: 5000,
    minSpend: 1500,
    pointsMultiplier: 2.0,
    discountPercent: 15,
    benefits: ['Earn 2x points per $1', '15% discount on purchases', 'VIP events access', 'Personal account manager', 'Free upgrades'],
    color: '#E5E4E2',
    icon: '💎',
    perks: ['2x point multiplier', '15% purchase discount', 'VIP event access', 'Personal account manager', 'Free tier upgrades']
  },
  DIAMOND: {
    displayName: 'Diamond',
    minPoints: 10000,
    minSpend: 5000,
    pointsMultiplier: 3.0,
    discountPercent: 20,
    benefits: ['Earn 3x points per $1', '20% discount on purchases', 'Lifetime VIP status', 'All exclusive perks', 'Founding member badge'],
    color: '#B9F2FF',
    icon: '👑',
    perks: ['3x point multiplier', '20% purchase discount', 'Lifetime VIP status', 'All exclusive perks', 'Founding member badge']
  }
};

// =====================================================
// POINT ACCUMULATION RULES
// =====================================================

export const POINT_RULES: Record<string, Omit<PointRule, 'id' | 'createdAt' | 'updatedAt'>> = {
  PURCHASE: {
    name: 'purchase',
    displayName: 'Purchase Points',
    type: 'purchase',
    pointsPerDollar: 10,
    maxPoints: null,
    dailyLimit: null,
    tierMultipliers: JSON.stringify({ SILVER: 1.25, GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 3.0 }),
    isActive: true,
    description: 'Earn points for every dollar spent'
  },
  PURCHASE_BONUS: {
    name: 'purchase_bonus',
    displayName: 'Purchase Bonus',
    type: 'bonus',
    points: 100,
    maxPoints: 500,
    dailyLimit: 500,
    tierMultipliers: null,
    isActive: true,
    description: 'Bonus points for qualifying purchases'
  },
  DAILY_LOGIN: {
    name: 'daily_login',
    displayName: 'Daily Login',
    type: 'action',
    points: 5,
    maxPoints: 35,
    dailyLimit: 35,
    tierMultipliers: JSON.stringify({ GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 3.0 }),
    isActive: true,
    description: 'Earn points for logging in daily (5 points/day, 7 days max/week)'
  },
  FIRST_PURCHASE: {
    name: 'first_purchase',
    displayName: 'First Purchase Bonus',
    type: 'milestone',
    points: 500,
    maxPoints: null,
    dailyLimit: null,
    tierMultipliers: null,
    isActive: true,
    description: 'One-time bonus for your first purchase'
  },
  REFERRAL_SIGNUP: {
    name: 'referral_signup',
    displayName: 'Referral Signup',
    type: 'referral',
    points: 100,
    maxPoints: 1000,
    dailyLimit: null,
    tierMultipliers: JSON.stringify({ GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 2.5 }),
    isActive: true,
    description: 'Points when someone signs up using your referral code'
  },
  REFERRAL_PURCHASE: {
    name: 'referral_purchase',
    displayName: 'Referral Purchase',
    type: 'referral',
    points: 500,
    maxPoints: 5000,
    dailyLimit: null,
    tierMultipliers: JSON.stringify({ GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 2.5 }),
    isActive: true,
    description: 'Bonus when your referral makes their first purchase'
  },
  BIRTHDAY_BONUS: {
    name: 'birthday_bonus',
    displayName: 'Birthday Bonus',
    type: 'bonus',
    points: 200,
    maxPoints: null,
    dailyLimit: null,
    tierMultipliers: JSON.stringify({ SILVER: 1.25, GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 3.0 }),
    isActive: true,
    description: 'Special birthday bonus points (200 base points)'
  },
  REVIEW: {
    name: 'review',
    displayName: 'Review Bonus',
    type: 'action',
    points: 50,
    maxPoints: 500,
    dailyLimit: 100,
    tierMultipliers: JSON.stringify({ GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 2.5 }),
    isActive: true,
    description: 'Earn points for writing verified reviews'
  },
  SOCIAL_SHARE: {
    name: 'social_share',
    displayName: 'Social Share',
    type: 'social',
    points: 25,
    maxPoints: 100,
    dailyLimit: 100,
    tierMultipliers: JSON.stringify({ GOLD: 1.5, PLATINUM: 2.0, DIAMOND: 2.0 }),
    isActive: true,
    description: 'Share on social media for points'
  },
  PROFILE_COMPLETE: {
    name: 'profile_complete',
    displayName: 'Profile Completion',
    type: 'onboarding',
    points: 100,
    maxPoints: null,
    dailyLimit: null,
    tierMultipliers: null,
    isActive: true,
    description: 'Complete your profile for bonus points'
  },
  TIER_BONUS: {
    name: 'tier_bonus',
    displayName: 'Tier Upgrade Bonus',
    type: 'milestone',
    points: 0, // Variable based on tier
    maxPoints: null,
    dailyLimit: null,
    tierMultipliers: null,
    isActive: true,
    description: 'Bonus points when reaching a new tier'
  },
  EVENT_BONUS: {
    name: 'event_bonus',
    displayName: 'Special Event Bonus',
    type: 'event',
    points: 100,
    maxPoints: 1000,
    dailyLimit: null,
    tierMultipliers: JSON.stringify({ PLATINUM: 1.5, DIAMOND: 2.0 }),
    isActive: true,
    description: 'Limited-time event bonus points'
  }
};

// =====================================================
// REWARD CATALOG
// =====================================================

export const REWARDS: Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'discount_5_percent',
    displayName: '5% Off Your Next Purchase',
    description: 'Get 5% off any purchase',
    category: 'discount',
    pointsCost: 500,
    monetaryValue: 5,
    discountType: 'percentage',
    discountValue: 5,
    code: 'LOYAL5',
    maxRedemptions: 1000,
    redemptionsRemaining: 750,
    perUserLimit: 5,
    validDays: 30,
    tierRequirement: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 1
  },
  {
    name: 'discount_10_percent',
    displayName: '10% Off Your Next Purchase',
    description: 'Get 10% off any purchase',
    category: 'discount',
    pointsCost: 1000,
    monetaryValue: 10,
    discountType: 'percentage',
    discountValue: 10,
    code: 'LOYAL10',
    maxRedemptions: 500,
    redemptionsRemaining: 350,
    perUserLimit: 3,
    validDays: 30,
    tierRequirement: null,
    isActive: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'discount_20_percent',
    displayName: '20% Off Premium Items',
    description: 'Get 20% off premium tools and subscriptions',
    category: 'discount',
    pointsCost: 2500,
    monetaryValue: 20,
    discountType: 'percentage',
    discountValue: 20,
    code: 'LOYAL20',
    maxRedemptions: 200,
    redemptionsRemaining: 150,
    perUserLimit: 2,
    validDays: 30,
    tierRequirement: 'SILVER',
    isActive: true,
    isFeatured: true,
    sortOrder: 3
  },
  {
    name: 'free_shipping',
    displayName: 'Free Expedited Shipping',
    description: 'Free expedited shipping on any order',
    category: 'discount',
    pointsCost: 750,
    monetaryValue: 15,
    discountType: 'fixed',
    discountValue: 15,
    code: 'FREESHIP',
    maxRedemptions: 500,
    redemptionsRemaining: 400,
    perUserLimit: 10,
    validDays: 60,
    tierRequirement: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 4
  },
  {
    name: 'gift_card_25',
    displayName: '$25 Gift Card',
    description: '$25 gift card for any purchase',
    category: 'gift_card',
    pointsCost: 2500,
    monetaryValue: 25,
    discountType: 'fixed',
    discountValue: 25,
    code: 'GC25',
    maxRedemptions: 100,
    redemptionsRemaining: 75,
    perUserLimit: 5,
    validDays: 365,
    tierRequirement: 'GOLD',
    isActive: true,
    isFeatured: true,
    sortOrder: 5
  },
  {
    name: 'gift_card_50',
    displayName: '$50 Gift Card',
    description: '$50 gift card for any purchase',
    category: 'gift_card',
    pointsCost: 4500,
    monetaryValue: 50,
    discountType: 'fixed',
    discountValue: 50,
    code: 'GC50',
    maxRedemptions: 50,
    redemptionsRemaining: 35,
    perUserLimit: 3,
    validDays: 365,
    tierRequirement: 'GOLD',
    isActive: true,
    isFeatured: true,
    sortOrder: 6
  },
  {
    name: 'exclusive_webinar',
    displayName: 'Exclusive VIP Webinar',
    description: 'Access to exclusive AI tools webinar with Q&A',
    category: 'experience',
    pointsCost: 3000,
    monetaryValue: 100,
    discountType: null,
    discountValue: null,
    maxRedemptions: 50,
    redemptionsRemaining: 40,
    perUserLimit: 1,
    validDays: null,
    tierRequirement: 'PLATINUM',
    isActive: true,
    isFeatured: true,
    sortOrder: 7
  },
  {
    name: 'early_access',
    displayName: 'Early Access Pass',
    description: 'Early access to new AI tools before public launch',
    category: 'exclusive',
    pointsCost: 5000,
    monetaryValue: 150,
    discountType: null,
    discountValue: null,
    maxRedemptions: 25,
    redemptionsRemaining: 20,
    perUserLimit: 1,
    validDays: null,
    tierRequirement: 'PLATINUM',
    isActive: true,
    isFeatured: true,
    sortOrder: 8
  },
  {
    name: 'custom_consultation',
    displayName: '1-on-1 Consultation',
    description: '30-minute personal consultation on AI tool selection',
    category: 'experience',
    pointsCost: 7500,
    monetaryValue: 200,
    discountType: null,
    discountValue: null,
    maxRedemptions: 10,
    redemptionsRemaining: 8,
    perUserLimit: 1,
    validDays: null,
    tierRequirement: 'PLATINUM',
    isActive: true,
    isFeatured: true,
    sortOrder: 9
  },
  {
    name: 'founding_member',
    displayName: 'Founding Member Status',
    description: 'Lifetime founding member badge and exclusive perks',
    category: 'exclusive',
    pointsCost: 15000,
    monetaryValue: 500,
    discountType: null,
    discountValue: null,
    maxRedemptions: 100,
    redemptionsRemaining: 85,
    perUserLimit: 1,
    validDays: null,
    tierRequirement: 'DIAMOND',
    isActive: true,
    isFeatured: true,
    sortOrder: 10
  },
  {
    name: 'swag_pack',
    displayName: 'Exclusive Swag Pack',
    description: 'Branded merchandise pack (t-shirt, mug, stickers)',
    category: 'merchandise',
    pointsCost: 4000,
    monetaryValue: 50,
    discountType: null,
    discountValue: null,
    maxRedemptions: 75,
    redemptionsRemaining: 60,
    perUserLimit: 2,
    validDays: null,
    tierRequirement: 'GOLD',
    isActive: true,
    isFeatured: false,
    sortOrder: 11
  },
  {
    name: 'free_month_pro',
    displayName: 'Free 1-Month Pro Subscription',
    description: 'Complimentary Pro subscription for one month',
    category: 'exclusive',
    pointsCost: 5000,
    monetaryValue: 99.99,
    discountType: null,
    discountValue: null,
    maxRedemptions: 100,
    redemptionsRemaining: 80,
    perUserLimit: 1,
    validDays: null,
    tierRequirement: 'SILVER',
    isActive: true,
    isFeatured: true,
    sortOrder: 12
  }
];

// =====================================================
// ACHIEVEMENTS & GAMIFICATION
// =====================================================

export const ACHIEVEMENTS: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    code: 'first_purchase',
    name: 'First Steps',
    displayName: 'First Purchase',
    description: 'Make your first purchase',
    category: 'purchases',
    pointsReward: 100,
    badgeIcon: '🛒',
    badgeColor: '#4CAF50',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'purchase_count', target: 1 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'bronze_member',
    name: 'Welcome to the Club',
    displayName: 'Bronze Member',
    description: 'Join the loyalty program',
    category: 'milestones',
    pointsReward: 50,
    badgeIcon: '🥉',
    badgeColor: '#CD7F32',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'tier_reached', target: 'BRONZE' }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'silver_member',
    name: 'Rising Star',
    displayName: 'Silver Member',
    description: 'Reach Silver tier status',
    category: 'milestones',
    pointsReward: 200,
    badgeIcon: '🥈',
    badgeColor: '#C0C0C0',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'tier_reached', target: 'SILVER' }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'gold_member',
    name: 'Gold Standard',
    displayName: 'Gold Member',
    description: 'Reach Gold tier status',
    category: 'milestones',
    pointsReward: 500,
    badgeIcon: '🥇',
    badgeColor: '#FFD700',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'tier_reached', target: 'GOLD' }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'platinum_member',
    name: 'Platinum Elite',
    displayName: 'Platinum Member',
    description: 'Reach Platinum tier status',
    category: 'milestones',
    pointsReward: 1000,
    badgeIcon: '💎',
    badgeColor: '#E5E4E2',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'tier_reached', target: 'PLATINUM' }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'diamond_member',
    name: 'Diamond Legend',
    displayName: 'Diamond Member',
    description: 'Reach the highest Diamond tier',
    category: 'milestones',
    pointsReward: 2500,
    badgeIcon: '👑',
    badgeColor: '#B9F2FF',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'tier_reached', target: 'DIAMOND' }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'referral_master',
    name: 'Referral Master',
    displayName: 'Referred 5 Friends',
    description: 'Successfully refer 5 friends who sign up',
    category: 'social',
    pointsReward: 500,
    badgeIcon: '👥',
    badgeColor: '#9C27B0',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'referral_count', target: 5 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'super_referrer',
    name: 'Super Referrer',
    displayName: 'Referred 25 Friends',
    description: 'Successfully refer 25 friends who sign up',
    category: 'social',
    pointsReward: 2000,
    badgeIcon: '🌟',
    badgeColor: '#FF9800',
    tierRequirement: 'GOLD',
    requirement: JSON.stringify({ type: 'referral_count', target: 25 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'reviewer',
    name: 'Word of Mouth',
    displayName: 'Wrote 5 Reviews',
    description: 'Write 5 verified reviews',
    category: 'engagement',
    pointsReward: 250,
    badgeIcon: '✍️',
    badgeColor: '#2196F3',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'review_count', target: 5 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'loyal_customer',
    name: 'Loyal Customer',
    displayName: '10 Purchases',
    description: 'Complete 10 purchases',
    category: 'purchases',
    pointsReward: 500,
    badgeIcon: '💳',
    badgeColor: '#673AB7',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'purchase_count', target: 10 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'big_spender',
    name: 'Big Spender',
    displayName: '$1000 Spent',
    description: 'Spend a total of $1000',
    category: 'purchases',
    pointsReward: 1000,
    badgeIcon: '💰',
    badgeColor: '#FFD700',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'total_spend', target: 1000 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'whale',
    name: 'Whale',
    displayName: '$5000 Spent',
    description: 'Spend a total of $5000',
    category: 'purchases',
    pointsReward: 3000,
    badgeIcon: '🐋',
    badgeColor: '#E91E63',
    tierRequirement: 'GOLD',
    requirement: JSON.stringify({ type: 'total_spend', target: 5000 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'daily_visitor',
    name: 'Daily Visitor',
    displayName: '7-Day Streak',
    description: 'Log in for 7 consecutive days',
    category: 'engagement',
    pointsReward: 100,
    badgeIcon: '🔥',
    badgeColor: '#FF5722',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'login_streak', target: 7 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'monthly_visitor',
    name: 'Monthly Visitor',
    displayName: '30-Day Streak',
    description: 'Log in for 30 consecutive days',
    category: 'engagement',
    pointsReward: 500,
    badgeIcon: '⭐',
    badgeColor: '#FFC107',
    tierRequirement: 'SILVER',
    requirement: JSON.stringify({ type: 'login_streak', target: 30 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'social_butterfly',
    name: 'Social Butterfly',
    displayName: 'Shared 10 Times',
    description: 'Share content on social media 10 times',
    category: 'social',
    pointsReward: 300,
    badgeIcon: '🦋',
    badgeColor: '#00BCD4',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'social_shares', target: 10 }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'vip_member',
    name: 'VIP Status',
    displayName: 'VIP Member',
    description: 'Achieve VIP status through referrals',
    category: 'special',
    pointsReward: 1500,
    badgeIcon: '🎖️',
    badgeColor: '#FFD700',
    tierRequirement: 'PLATINUM',
    requirement: JSON.stringify({ type: 'vip_status', target: true }),
    isHidden: false,
    isActive: true
  },
  {
    code: 'founding_member',
    name: 'Founding Member',
    displayName: 'Founding Member',
    description: 'Join during the first year',
    category: 'special',
    pointsReward: 1000,
    badgeIcon: '🏛️',
    badgeColor: '#9C27B0',
    tierRequirement: null,
    requirement: JSON.stringify({ type: 'founding_member', target: true }),
    isHidden: true,
    isActive: true
  }
];

// =====================================================
// LOYALTY CHALLENGES
// =====================================================

export const LOYALTY_CHALLENGES: Omit<LoyaltyChallenge, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'weekly_points_rush',
    displayName: 'Weekly Points Rush',
    description: 'Earn the most points this week!',
    category: 'weekly',
    type: 'points_earned',
    target: 1000,
    pointsReward: 500,
    bonusReward: 250,
    tierRequirement: null,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    isActive: true,
    isGlobal: true,
    participantCount: 156
  },
  {
    name: 'monthly_referral_challenge',
    displayName: 'Monthly Referral Challenge',
    description: 'Refer the most friends this month',
    category: 'monthly',
    type: 'referrals',
    target: 10,
    pointsReward: 1000,
    bonusReward: 500,
    tierRequirement: null,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
    isActive: true,
    isGlobal: true,
    participantCount: 89
  },
  {
    name: 'spring_spending_spree',
    displayName: 'Spring Spending Spree',
    description: 'Spend $500 or more this season',
    category: 'seasonal',
    type: 'purchases',
    target: 500,
    pointsReward: 2000,
    bonusReward: 1000,
    tierRequirement: 'GOLD',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    isGlobal: true,
    participantCount: 234
  },
  {
    name: 'login_streak_week',
    displayName: 'Login Streak Week',
    description: 'Log in every day this week',
    category: 'weekly',
    type: 'activities',
    target: 7,
    pointsReward: 300,
    bonusReward: 100,
    tierRequirement: null,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isActive: true,
    isGlobal: true,
    participantCount: 445
  }
];

// =====================================================
// REFERRAL PROGRAM CONFIGURATION
// =====================================================

export const REFERRAL_CONFIG = {
  REFERRAL_BONUS_POINTS: 100,
  REFERRAL_PURCHASE_POINTS: 500,
  MAX_REFERRALS_PER_DAY: 5,
  REFERRAL_CODE_LENGTH: 8,
  REWARD_TIERS: {
    BRONZE: { signup: 100, purchase: 500 },
    SILVER: { signup: 150, purchase: 750 },
    GOLD: { signup: 200, purchase: 1000 },
    PLATINUM: { signup: 300, purchase: 1500 },
    DIAMOND: { signup: 500, purchase: 2500 }
  }
};

// =====================================================
// POINT EXPIRATION CONFIGURATION
// =====================================================

export const POINT_EXPIRATION = {
  EXPIRATION_MONTHS: 12,
  EXPIRATION_WARNING_DAYS: 30,
  EXPIRATION_NOTICE_COUNT: 3,
  ACTIVE_MEMBERS_EXEMPT: true,
  EXTENDED_FOR_TIERS: ['PLATINUM', 'DIAMOND']
};

// =====================================================
// CORE FUNCTIONS
// =====================================================

export function calculateTier(points: number, spend: number): LoyaltyTier {
  if (points >= LOYALTY_TIERS.DIAMOND.minPoints && spend >= LOYALTY_TIERS.DIAMOND.minSpend) {
    return 'DIAMOND';
  }
  if (points >= LOYALTY_TIERS.PLATINUM.minPoints && spend >= LOYALTY_TIERS.PLATINUM.minSpend) {
    return 'PLATINUM';
  }
  if (points >= LOYALTY_TIERS.GOLD.minPoints && spend >= LOYALTY_TIERS.GOLD.minSpend) {
    return 'GOLD';
  }
  if (points >= LOYALTY_TIERS.SILVER.minPoints && spend >= LOYALTY_TIERS.SILVER.minSpend) {
    return 'SILVER';
  }
  return 'BRONZE';
}

export function getTierProgress(points: number, spend: number, currentTier: LoyaltyTier): {
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  spendToNext: number;
  progressPercent: number;
} {
  const tiers: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex >= tiers.length - 1) {
    return { currentTier, nextTier: null, pointsToNext: 0, spendToNext: 0, progressPercent: 100 };
  }
  
  const nextTier = tiers[currentIndex + 1] as LoyaltyTier;
  const nextTierConfig = LOYALTY_TIERS[nextTier];
  const currentTierConfig = LOYALTY_TIERS[currentTier];
  
  const pointsToNext = Math.max(0, nextTierConfig.minPoints - points);
  const spendToNext = Math.max(0, nextTierConfig.minSpend - spend);
  const totalNeeded = Math.max(
    nextTierConfig.minPoints - currentTierConfig.minPoints,
    nextTierConfig.minSpend - currentTierConfig.minSpend
  );
  const currentProgress = Math.max(
    points - currentTierConfig.minPoints,
    spend - currentTierConfig.minSpend
  );
  
  return {
    currentTier,
    nextTier,
    pointsToNext,
    spendToNext,
    progressPercent: Math.min(100, Math.round((currentProgress / totalNeeded) * 100))
  };
}

export function calculatePointsEarned(
  amount: number,
  userTier: LoyaltyTier,
  ruleName: string = 'PURCHASE'
): number {
  const rule = POINT_RULES[ruleName];
  if (!rule) return 0;
  
  const basePoints = rule.pointsPerDollar ? Math.round(amount * rule.pointsPerDollar) : (rule.points || 0);
  const multiplier = LOYALTY_TIERS[userTier].pointsMultiplier;
  
  return Math.round(basePoints * multiplier);
}

export function getPointsMultiplier(userTier: LoyaltyTier): number {
  return LOYALTY_TIERS[userTier].pointsMultiplier;
}

export function getDiscountForTier(userTier: LoyaltyTier): number {
  return LOYALTY_TIERS[userTier].discountPercent;
}

export function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.toUpperCase();
}

export function isBirthdayThisMonth(birthday: Date | null): boolean {
  if (!birthday) return false;
  const now = new Date();
  return birthday.getMonth() === now.getMonth();
}

export function getBirthdayBonusPoints(userTier: LoyaltyTier): number {
  const basePoints = POINT_RULES.BIRTHDAY_BONUS.points || 0;
  return Math.round(basePoints * LOYALTY_TIERS[userTier].pointsMultiplier);
}

export function calculateExpirationDate(months: number = POINT_EXPIRATION.EXPIRATION_MONTHS): Date {
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + months);
  return expirationDate;
}

export function getExpiringPoints(transactions: PointTransaction[], daysAhead: number = 30): {
  expiringPoints: number;
  expirationDate: Date;
}[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  const expiringTransactions = transactions.filter(t => 
    t.expiresAt && 
    t.expiresAt > now && 
    t.expiresAt <= futureDate && 
    t.points > 0 &&
    !(t as any).isExpiring
  );
  
  const groupedByExpiration: Record<string, number> = {};
  for (const t of expiringTransactions) {
    if (t.expiresAt) {
      const dateKey = t.expiresAt.toISOString().split('T')[0];
      groupedByExpiration[dateKey] = (groupedByExpiration[dateKey] || 0) + t.points;
    }
  }
  
  return Object.entries(groupedByExpiration).map(([date, points]) => ({
    expiringPoints: points,
    expirationDate: new Date(date)
  }));
}

export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return (points / 1000000).toFixed(1) + 'M';
  }
  if (points >= 1000) {
    return (points / 1000).toFixed(1) + 'K';
  }
  return points.toString();
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
}

export function getTierIcon(tier: LoyaltyTier): string {
  return LOYALTY_TIERS[tier].icon;
}

export function getTierColor(tier: LoyaltyTier): string {
  return LOYALTY_TIERS[tier].color;
}

export function getRewardsByCategory(category: string): Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>[] {
  return REWARDS.filter(r => r.category === category && r.isActive);
}

export function getFeaturedRewards(): Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>[] {
  return REWARDS.filter(r => r.isFeatured && r.isActive).slice(0, 6);
}

export function getRewardsForTier(tier: LoyaltyTier): Omit<Reward, 'id' | 'createdAt' | 'updatedAt'>[] {
  const tierOrder: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const tierIndex = tierOrder.indexOf(tier);
  
  return REWARDS.filter(r => {
    if (!r.isActive) return false;
    if (!r.tierRequirement) return true;
    const requirementIndex = tierOrder.indexOf(r.tierRequirement as LoyaltyTier);
    return requirementIndex <= tierIndex;
  });
}

export function canRedeemReward(userPoints: number, reward: Reward, userTier: LoyaltyTier): boolean {
  if (userPoints < reward.pointsCost) return false;
  if (reward.tierRequirement) {
    const tierOrder: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const rewardTierIndex = tierOrder.indexOf(reward.tierRequirement as LoyaltyTier);
    const userTierIndex = tierOrder.indexOf(userTier);
    if (userTierIndex < rewardTierIndex) return false;
  }
  return true;
}