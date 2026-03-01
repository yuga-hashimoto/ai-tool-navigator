import { LoyaltyTier, PointTransaction, LoyaltyUser, Achievement, UserAchievement } from '@/lib/loyalty/loyalty-types';

export type Tier = LoyaltyTier;
export type Badge = UserAchievement;

export interface Transaction {
  id: string;
  points: number;
  type: string;
  source?: string;
  sourceId?: string | null;
  sourceType?: string | null;
  description: string;
  createdAt: Date;
}

export interface UserPoints {
  points: number;
  tier: Tier;
  lastActivity: Date;
  lifetimePoints: number;
}

export interface LoyaltyState {
  userPoints: UserPoints | null;
  transactions: Transaction[];
  tiers: Tier[];
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

export type LoyaltyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SYNC_DATA'; payload: Partial<LoyaltyState> }
  | { type: 'EARN_POINTS'; payload: { points: number; transaction: Transaction } }
  | { type: 'REDEEM_POINTS'; payload: { points: number; transaction: Transaction } }
  | { type: 'UPDATE_TIER'; payload: { tier: Tier } }
  | { type: 'ADD_BADGE'; payload: Badge }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_TIERS'; payload: Tier[] }
  | { type: 'SET_BADGES'; payload: Badge[] };
