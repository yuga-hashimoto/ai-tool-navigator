export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface UserPoints {
  points: number;
  tier: string;
  lastActivity: Date;
}

export interface Transaction {
  id: string;
  points: number;
  type: 'earn' | 'redeem';
  source: string;
  description: string;
  createdAt: Date;
}

export interface Tier {
  id: string;
  name: string;
  minPoints: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
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
