// LoyaltyPointsProvider - Core context for point management
import { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  LoyaltyDashboardData,
  PointTransaction as Transaction,
  LoyaltyTier as Tier,
  Achievement as Badge
} from '../lib/loyalty/loyalty-types';

export interface LoyaltyState {
  userPoints: any | null;
  transactions: Transaction[];
  tiers: Tier[];
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

export type LoyaltyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_DATA'; payload: Partial<LoyaltyState> }
  | { type: 'EARN_POINTS'; payload: { points: number; transaction: Transaction } }
  | { type: 'REDEEM_POINTS'; payload: { points: number; transaction: Transaction } }
  | { type: 'UPDATE_TIER'; payload: { tier: Tier } }
  | { type: 'ADD_BADGE'; payload: Badge }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_TIERS'; payload: Tier[] }
  | { type: 'SET_BADGES'; payload: Badge[] };

// Initial state
const initialState: LoyaltyState = {
  userPoints: null,
  transactions: [],
  tiers: [],
  badges: [],
  isLoading: true,
  error: null,
  lastSync: null
};

// Loyalty context
const LoyaltyContext = createContext<{
  state: LoyaltyState;
  dispatch: React.Dispatch<LoyaltyAction>;
  actions: LoyaltyActions;
} | null>(null);

// Loyalty reducer
function loyaltyReducer(state: LoyaltyState, action: LoyaltyAction): LoyaltyState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SYNC_DATA':
      return { ...state, ...action.payload, lastSync: new Date() };
    
    case 'EARN_POINTS':
      return {
        ...state,
        userPoints: {
          ...state.userPoints!,
          points: state.userPoints!.points + action.payload.points,
          lastActivity: new Date()
        },
        transactions: [...state.transactions, action.payload.transaction]
      };
    
    case 'REDEEM_POINTS':
      return {
        ...state,
        userPoints: {
          ...state.userPoints!,
          points: state.userPoints!.points - action.payload.points,
          lastActivity: new Date()
        },
        transactions: [...state.transactions, action.payload.transaction]
      };
    
    case 'UPDATE_TIER':
      return {
        ...state,
        userPoints: {
          ...state.userPoints!,
          tier: action.payload.tier
        }
      };
    
    case 'ADD_BADGE':
      return {
        ...state,
        badges: [...state.badges, action.payload]
      };
    
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    
    case 'SET_TIERS':
      return { ...state, tiers: action.payload };
    
    case 'SET_BADGES':
      return { ...state, badges: action.payload };
    
    default:
      return state;
  }
}

// Loyalty actions
interface LoyaltyActions {
  syncData: () => Promise<void>;
  earnPoints: (points: number, source: string, description?: string) => Promise<void>;
  redeemPoints: (points: number, rewardId: string) => Promise<void>;
  getBalance: () => Promise<void>;
  getHistory: () => Promise<void>;
  getTiers: () => Promise<void>;
  getBadges: () => Promise<void>;
  addBadge: (badge: Badge) => void;
  updateTier: (tier: Tier) => void;
}

// Custom hook for loyalty context
export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
}

// Loyalty provider component
export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(loyaltyReducer, initialState);

  // Loyalty actions
  const actions: LoyaltyActions = {
    syncData: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [balance, history, tiers, badges] = await Promise.all([
          fetch('/api/loyalty/balance').then(r => r.json()),
          fetch('/api/loyalty/history').then(r => r.json()),
          fetch('/api/loyalty/tiers').then(r => r.json()),
          fetch('/api/loyalty/badges').then(r => r.json())
        ]);
        
        dispatch({
          type: 'SYNC_DATA',
          payload: {
            userPoints: balance.data,
            transactions: history.data,
            tiers: tiers.data,
            badges: badges.data,
            isLoading: false,
            error: null
          }
        });
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Failed to sync loyalty data' 
        });
      }
    },

    earnPoints: async (points: number, source: string, description?: string) => {
      try {
        const response = await fetch('/api/loyalty/earn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points, source, description })
        });
        
        if (response.ok) {
          const result = await response.json();
          const transaction: Transaction = {
            id: result.data.id,
            userId: 'current-user', // Mock or derive
            points,
            type: 'PURCHASE_BONUS', // Assuming a valid type from PointTransactionType
            balanceBefore: state.userPoints?.points || 0,
            balanceAfter: (state.userPoints?.points || 0) + points,
            sourceId: null,
            sourceType: source,
            isExpiring: false,
            expiresAt: null,
            description: description || `Earned ${points} points from ${source}`,
            createdAt: result.data.createdAt || new Date()
          };
          
          dispatch({ 
            type: 'EARN_POINTS', 
            payload: { points, transaction } 
          });
        }
      } catch (error) {
        console.error('Failed to earn points:', error);
      }
    },

    redeemPoints: async (points: number, rewardId: string) => {
      try {
        const response = await fetch('/api/loyalty/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points, rewardId })
        });
        
        if (response.ok) {
          const result = await response.json();
          const transaction: Transaction = {
            id: result.data.id,
            userId: 'current-user', // Mock or derive
            points: -points,
            type: 'MANUAL_ADJUSTMENT', // Assuming a valid type
            balanceBefore: state.userPoints?.points || 0,
            balanceAfter: (state.userPoints?.points || 0) - points,
            sourceId: rewardId,
            sourceType: 'REWARD',
            isExpiring: false,
            expiresAt: null,
            description: `Redeemed ${points} points for reward`,
            createdAt: result.data.createdAt || new Date()
          };
          
          dispatch({ 
            type: 'REDEEM_POINTS', 
            payload: { points, transaction } 
          });
        }
      } catch (error) {
        console.error('Failed to redeem points:', error);
      }
    },

    getBalance: async () => {
      try {
        const response = await fetch('/api/loyalty/balance');
        const result = await response.json();
        dispatch({ 
          type: 'SYNC_DATA', 
          payload: { userPoints: result.data } 
        });
      } catch (error) {
        console.error('Failed to get balance:', error);
      }
    },

    getHistory: async () => {
      try {
        const response = await fetch('/api/loyalty/history');
        const result = await response.json();
        dispatch({ 
          type: 'SET_TRANSACTIONS', 
          payload: result.data 
        });
      } catch (error) {
        console.error('Failed to get history:', error);
      }
    },

    getTiers: async () => {
      try {
        const response = await fetch('/api/loyalty/tiers');
        const result = await response.json();
        dispatch({ 
          type: 'SET_TIERS', 
          payload: result.data 
        });
      } catch (error) {
        console.error('Failed to get tiers:', error);
      }
    },

    getBadges: async () => {
      try {
        const response = await fetch('/api/loyalty/badges');
        const result = await response.json();
        dispatch({ 
          type: 'SET_BADGES', 
          payload: result.data 
        });
      } catch (error) {
        console.error('Failed to get badges:', error);
      }
    },

    addBadge: (badge: Badge) => {
      dispatch({ type: 'ADD_BADGE', payload: badge });
    },

    updateTier: (tier: Tier) => {
      dispatch({ type: 'UPDATE_TIER', payload: { tier } });
    }
  };

  // Auto-sync data on mount and periodically
  useEffect(() => {
    actions.syncData();
    
    const interval = setInterval(() => {
      if (state.lastSync) {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (state.lastSync < fiveMinutesAgo) {
          actions.syncData();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <LoyaltyContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export default LoyaltyProvider;