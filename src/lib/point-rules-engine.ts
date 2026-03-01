type PointEarningRule = {
  id: string;
  trigger: 'purchase' | 'review' | 'referral' | 'social_share' | 'sign_up' | 'occasion';
  multiplier: number;
  basePoints: number;
  description: string;
  conditions?: {
    minPurchaseAmount?: number;
    reviewCount?: number;
    referralCount?: number;
    socialShares?: number;
    purchaseCount?: number;
    dateIs?: 'weekend' | 'holiday' | 'month_end' | 'year_anniversary';
  };
};

// Reward catalog definition
type Reward = {
  id: string;
  name: string;
  description: string;
  requiredPoints: number;
  type: 'discount' | 'exclusive_content' | 'premium_feature';
  benefits: {
    discountPct?: number;
    contentId?: string;
    featureId?: string;
    expirationDays?: number;
  };
  icon: string;
};

// Tier definition
type TierDefinition = {
  name: string;
  minPoints: number;
  maxPoints?: number;
  earningMultiplier: number;
  rewards: Reward[];
  benefits: string[];
  icon: string;
};

// Badge definition
type BadgeDefinition = {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: 'first_purchase' | 'review_count' | 'referee_count' | 'social_share_count' | 'tier_up' | number;
  threshold: number;
};

// Rules engine responsible for calculating points
class PointRulesEngine {
  private rules: PointEarningRule[] = [];
  private rewards: Reward[] = [];
  private tiers: TierDefinition[] = [];
  private badges: BadgeDefinition[] = [];

  constructor(rewards: Reward[], tiers: TierDefinition[], badges: BadgeDefinition[]) {
    this.rewards = rewards;
    this.tiers = tiers;
    this.badges = badges;
    
    // Define default earning rules
    this.rules = [
      {
        id: 'purchase',
        trigger: 'purchase',
        multiplier: 1,
        basePoints: 100, // 1 point per $1
        description: 'Earn points from purchases',
        conditions: {
          minPurchaseAmount: 0
        }
      },
      {
        id: 'review',
        trigger: 'review',
        multiplier: 1,
        basePoints: 50,
        description: 'Earn points for product reviews',
        conditions: {
          reviewCount: 1
        }
      },
      {
        id: 'referral',
        trigger: 'referral',
        multiplier: 1,
        basePoints: 200,
        description: 'Earn points for successful referrals',
        conditions: {
          referralCount: 1
        }
      },
      {
        id: 'social_share',
        trigger: 'social_share',
        multiplier: 1,
        basePoints: 25,
        description: 'Earn points for social sharing',
        conditions: {
          socialShares: 1
        }
      },
      {
        id: 'sign_up',
        trigger: 'sign_up',
        multiplier: 1,
        basePoints: 100,
        description: 'Bonus points for account creation',
        conditions: {
          minPurchaseAmount: 0
        }
      }
    ];
  }

  // Calculate points based on transaction type
  calculatePoints(trigger: string, userContext?: any): PointEarningRule | null {
    const matchingRule = this.rules.find(rule => 
      rule.trigger === trigger &&
      (!rule.conditions || this.matchesConditions(rule.conditions, userContext))
    );
    
    return matchingRule || null;
  }

  // Check if conditions are met for a rule
  private matchesConditions(conditions: any, userContext: any): boolean {
    for (const conditionKey in conditions) {
      const conditionValue = conditions[conditionKey];
      
      if (conditionKey === 'minPurchaseAmount' && userContext.amount >= conditionValue) {
        return true;
      }
      if (conditionKey === 'reviewCount' && userContext.reviewCount >= conditionValue) {
        return true;
      }
      if (conditionKey === 'referralCount' && userContext.referralCount >= conditionValue) {
        return true;
      }
      if (conditionKey === 'socialShares' && userContext.socialShares >= conditionValue) {
        return true;
      }
      if (conditionKey === 'purchaseCount' && userContext.purchaseCount >= conditionValue) {
        return true;
      }
      if (conditionKey === 'dateIs' && this.checkDateCondition(conditionValue)) {
        return true;
      }
    }
    return true;
  }

  // Check date-based conditions
  private checkDateCondition(dateCondition: string): boolean {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (dateCondition) {
      case 'weekend':
        const dayOfWeek = now.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      case 'holiday':
        // In a real implementation, this would check against a holiday calendar
        // For demo purposes, we'll simulate a simple holiday check
        const holidays = ['01-01', '12-25']; // New Year's Day, Christmas
        return holidays.includes(today);
      case 'month_end':
        return now.getDate() > 25;
      case 'year_anniversary':
        return now.getMonth() === 0 && now.getDate() === 1; // Simplified - Jan 1
      default:
        return false;
    }
  }

  // Calculate actual points with multipliers and bonus logic
  calculateEarningPoints(trigger: string, basePoints: number, userContext?: any): number {
    let multiplier = 1;
    
    // Apply rule-specific multiplier
    const rule = this.calculatePoints(trigger, userContext);
    if (rule) {
      multiplier = rule.multiplier;
    }
    
    // Apply tier multiplier
    if (userContext && userContext.tier) {
      const tier = this.getTierForPoints(userContext.points);
      if (tier) {
        multiplier *= tier.earningMultiplier;
      }
    }
    
    // Apply special condition modifiers
    if (userContext) {
      const dateModifier = this.getDateModifier();
      if (dateModifier > 1) {
        multiplier *= dateModifier;
      }
    }
    
    return Math.floor(basePoints * multiplier);
  }

  // Get date-based earning modifiers
  private getDateModifier(): number {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const month = now.getMonth();
    const date = now.getDate();
    
    // Weekend bonus
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 1.5;
    }
    
    // Holiday bonus (simplified)
    const holidays = [
      '01-01', '12-25', '2026-02-14', '2026-07-04', '2026-11-26'
    ];
    const today = now.toISOString().split('T')[0];
    if (holidays.includes(today)) {
      return 2.0;
    }
    
    // Special event bonuses
    if (month === 11 && date >= 20 && date <= 26) { // Black Friday week
      return 2.5;
    }
    
    return 1.0; // No bonus
  }

  // Get reward by ID
  getRewardById(id: string): Reward | undefined {
    return this.rewards.find(reward => reward.id === id);
  }

  // Get tier by name
  getTierByName(name: string): TierDefinition | undefined {
    return this.tiers.find(tier => tier.name.toLowerCase() === name.toLowerCase());
  }

  // Get tier by point range
  getTierForPoints(points: number): TierDefinition | undefined {
    return this.tiers.find(tier => 
      points >= tier.minPoints && 
      (!tier.maxPoints || points < tier.maxPoints)
    );
  }

  // Get all available badges
  getAvailableBadges(): BadgeDefinition[] {
    return this.badges;
  }

  // Check if badge criteria are met
  checkBadgeEligibility(badge: BadgeDefinition, userData: any): boolean {
    const criteria = badge.criteria;
    const threshold = badge.threshold;
    
    switch (criteria) {
      case 'first_purchase':
        return userData.purchaseCount && userData.purchaseCount === 1;
      case 'review_count':
        return userData.reviewCount && userData.reviewCount >= threshold;
      case 'referee_count':
        return userData.referralCount && userData.referralCount >= threshold;
      case 'social_share_count':
        return userData.socialShares && userData.socialShares >= threshold;
      default:
        return userData[criteria] && userData[criteria] >= threshold;
    }
  }
}

export type { PointEarningRule, Reward, TierDefinition, BadgeDefinition, PointRulesEngine };