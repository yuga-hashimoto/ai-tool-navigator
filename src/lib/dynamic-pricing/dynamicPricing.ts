// =====================================================
// DYNAMIC PRICING & URGENCY INCENTIVES
// =====================================================
// Time-sensitive pricing tiers, dynamic adjustments, countdown timers,
// and urgency-based bundle pricing to drive checkout completion

export type PricingTierType = 'standard' | 'early_bird' | 'last_chance' | 'flash_sale' | 'member_exclusive';

export interface DynamicPriceConfig {
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  adjustmentStrategy: 'linear' | 'exponential' | 'step' | 'demand_based';
  adjustmentSpeed: number; // How fast prices adjust (0-1)
  demandMultiplier: number; // Current demand factor
  urgencyMultiplier: number; // Current urgency factor
}

export interface TimeSensitiveTier {
  id: string;
  type: PricingTierType;
  name: string;
  displayName: string;
  description: string;
  discountPercent: number;
  originalPrice: number;
  currentPrice: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  maxPurchases?: number;
  currentPurchases: number;
  badge?: string;
  badgeColor?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface UrgencyBundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  originalTotal: number;
  bundlePrice: number;
  savingsAmount: number;
  savingsPercent: number;
  urgencyType: 'bundle_discount' | 'limited_time' | 'low_stock' | 'price_increase_coming';
  urgencyMessage: string;
  countdownEnd?: Date;
  stockRemaining?: number;
  maxStock?: number;
  popular?: boolean;
  bestValue?: boolean;
}

export interface BundleItem {
  id: string;
  name: string;
  originalPrice: number;
  quantity?: number;
}

export interface PriceChangeEvent {
  id: string;
  timestamp: Date;
  tierId: string;
  previousPrice: number;
  newPrice: number;
  reason: 'demand' | 'time' | 'conversion_optimization' | 'manual';
  conversionRate: number;
  revenue: number;
}

export interface UrgencyConversionMetrics {
  tierId: string;
  period: string;
  views: number;
  addToCarts: number;
  checkouts: number;
  conversions: number;
  conversionRate: number;
  avgTimeToPurchase: number;
  urgencyImpact: number; // % improvement from urgency signals
  revenue: number;
  arpu: number;
}

export interface UrgencySignal {
  type: 'countdown' | 'stock_warning' | 'price_increase' | 'popular_choice' | 'limited_edition';
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
  actionRequired?: string;
}

// =====================================================
// TIME-SENSITIVE PRICING TIERS
// =====================================================

export const TIME_SENSITIVE_TIERS: TimeSensitiveTier[] = [
  {
    id: 'early_bird_pro',
    type: 'early_bird',
    name: 'Early Bird Pro',
    displayName: '🎉 Early Bird Deal',
    description: 'Lock in your Pro subscription at a special early bird rate',
    discountPercent: 30,
    originalPrice: 99.99,
    currentPrice: 69.99,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 100,
    currentPurchases: 67,
    badge: 'EARLY BIRD',
    badgeColor: 'green',
    urgencyLevel: 'high'
  },
  {
    id: 'last_chance_enterprise',
    type: 'last_chance',
    name: 'Last Chance Enterprise',
    displayName: '⚡ Last Chance',
    description: 'Final opportunity to get Enterprise at this rate',
    discountPercent: 25,
    originalPrice: 499.99,
    currentPrice: 374.99,
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 50,
    currentPurchases: 43,
    badge: 'LAST CHANCE',
    badgeColor: 'red',
    urgencyLevel: 'critical'
  },
  {
    id: 'flash_sale_basic',
    type: 'flash_sale',
    name: 'Flash Sale Basic',
    displayName: '🔥 Flash Sale',
    description: 'Limited-time upgrade opportunity',
    discountPercent: 50,
    originalPrice: 9.99,
    currentPrice: 4.99,
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 25,
    currentPurchases: 18,
    badge: 'FLASH SALE',
    badgeColor: 'orange',
    urgencyLevel: 'critical'
  },
  {
    id: 'member_exclusive',
    type: 'member_exclusive',
    name: 'Member Exclusive',
    displayName: '⭐ Member Exclusive',
    description: 'Special pricing available only to registered members',
    discountPercent: 20,
    originalPrice: 99.99,
    currentPrice: 79.99,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 500,
    currentPurchases: 234,
    badge: 'MEMBER ONLY',
    badgeColor: 'purple',
    urgencyLevel: 'medium'
  }
];

// =====================================================
// URGENCY BUNDLE PRICING
// =====================================================

export const URGENCY_BUNDLES: UrgencyBundle[] = [
  {
    id: 'pro_power_pack',
    name: 'Pro Power Pack',
    description: 'Everything you need to maximize your AI tool discovery',
    items: [
      { id: 'pro_sub', name: 'Pro Subscription (1 Year)', originalPrice: 99.99 },
      { id: 'priority_support', name: 'Priority Support', originalPrice: 49.99 },
      { id: 'advanced_analytics', name: 'Advanced Analytics', originalPrice: 29.99 }
    ],
    originalTotal: 179.97,
    bundlePrice: 129.99,
    savingsAmount: 49.98,
    savingsPercent: 28,
    urgencyType: 'limited_time',
    urgencyMessage: 'Bundle discount ends in:',
    countdownEnd: new Date(Date.now() + 48 * 60 * 60 * 1000),
    popular: true
  },
  {
    id: 'enterprise_max',
    name: 'Enterprise Max Bundle',
    description: 'Complete enterprise solution with maximum savings',
    items: [
      { id: 'enterprise_sub', name: 'Enterprise Subscription (1 Year)', originalPrice: 499.99 },
      { id: 'team_seats', name: 'Additional Team Seats (5)', originalPrice: 299.99 },
      { id: 'api_credits', name: 'API Credits (100K)', originalPrice: 199.99 },
      { id: 'custom_onboarding', name: 'Custom Onboarding', originalPrice: 149.99 }
    ],
    originalTotal: 1149.96,
    bundlePrice: 799.99,
    savingsAmount: 349.97,
    savingsPercent: 30,
    urgencyType: 'low_stock',
    urgencyMessage: 'Only 12 bundles remaining at this price:',
    stockRemaining: 12,
    maxStock: 50,
    bestValue: true
  },
  {
    id: 'starter_value_pack',
    name: 'Starter Value Pack',
    description: 'Perfect way to upgrade from Basic to Pro',
    items: [
      { id: 'pro_sub_monthly', name: 'Pro Subscription (3 Months)', originalPrice: 29.97 },
      { id: 'custom_lists', name: 'Custom Lists Addon', originalPrice: 14.99 }
    ],
    originalTotal: 44.96,
    bundlePrice: 34.99,
    savingsAmount: 9.97,
    savingsPercent: 22,
    urgencyType: 'price_increase_coming',
    urgencyMessage: 'Price increases in:',
    countdownEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'developer_bundle',
    name: 'Developer API Bundle',
    description: 'Everything developers need for API integration',
    items: [
      { id: 'pro_sub', name: 'Pro Subscription (1 Year)', originalPrice: 99.99 },
      { id: 'api_basic', name: 'API Basic Access', originalPrice: 99.99 },
      { id: 'webhooks', name: 'Webhooks Addon', originalPrice: 29.99 }
    ],
    originalTotal: 229.97,
    bundlePrice: 169.99,
    savingsAmount: 59.98,
    savingsPercent: 26,
    urgencyType: 'bundle_discount',
    urgencyMessage: 'Save 26% with this bundle:',
    popular: true
  }
];

// =====================================================
// DYNAMIC PRICE ADJUSTMENT LOGIC
// =====================================================

export function calculateDynamicPrice(config: DynamicPriceConfig, conversionRate: number): number {
  const { basePrice, minPrice, maxPrice, adjustmentStrategy, adjustmentSpeed } = config;
  const demandFactor = conversionRate > 0.05 ? 1 + (conversionRate - 0.05) * 0.5 : 0.95;
  const urgencyFactor = 1 + (config.urgencyMultiplier * 0.1);
  let adjustedPrice = basePrice * demandFactor * urgencyFactor;

  switch (adjustmentStrategy) {
    case 'linear':
      adjustedPrice = basePrice + (adjustedPrice - basePrice) * adjustmentSpeed;
      break;
    case 'exponential':
      adjustedPrice = basePrice * Math.pow(demandFactor, adjustmentSpeed);
      break;
    case 'step':
      adjustedPrice = conversionRate > 0.08 ? basePrice * 1.1 : 
                     conversionRate > 0.05 ? basePrice : basePrice * 0.95;
      break;
    case 'demand_based':
      adjustedPrice = basePrice * (1 + (conversionRate - 0.03));
      break;
  }

  return Math.round(Math.min(maxPrice, Math.max(minPrice, adjustedPrice)) * 100) / 100;
}

export function getTimeSensitivePrice(tierId: string): TimeSensitiveTier | null {
  const tier = TIME_SENSITIVE_TIERS.find(t => t.id === tierId);
  if (!tier || !tier.isActive) return null;
  if (new Date() > tier.endDate) return null;
  return tier;
}

export function getActiveTimeSensitiveTiers(): TimeSensitiveTier[] {
  const now = new Date();
  return TIME_SENSITIVE_TIERS.filter(tier => 
    tier.isActive && now >= tier.startDate && now <= tier.endDate
  );
}

export function getBundleSavings(bundleId: string): UrgencyBundle | null {
  return URGENCY_BUNDLES.find(b => b.id === bundleId) || null;
}

// =====================================================
// COUNTDOWN & URGENCY SIGNALS
// =====================================================

export function generateCountdownMessage(endDate: Date): UrgencySignal {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      type: 'price_increase',
      message: 'Offer has expired',
      urgencyLevel: 'low'
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let urgencyLevel: UrgencySignal['urgencyLevel'] = 'low';
  if (hours < 1) urgencyLevel = 'critical';
  else if (hours < 6) urgencyLevel = 'high';
  else if (hours < 24) urgencyLevel = 'medium';

  return {
    type: 'countdown',
    message: `${hours}h ${minutes}m ${seconds}s remaining`,
    urgencyLevel,
    expiresAt: endDate,
    actionRequired: 'Complete your purchase now to lock in this price!'
  };
}

export function generateStockWarning(stockRemaining: number, maxStock: number): UrgencySignal {
  const stockPercent = (stockRemaining / maxStock) * 100;
  let urgencyLevel: UrgencySignal['urgencyLevel'] = 'low';
  if (stockPercent <= 5) urgencyLevel = 'critical';
  else if (stockPercent <= 15) urgencyLevel = 'high';
  else if (stockPercent <= 30) urgencyLevel = 'medium';

  return {
    type: 'stock_warning',
    message: `Only ${stockRemaining} left at this price!`,
    urgencyLevel,
    actionRequired: 'Order now before they\'re gone'
  };
}

export function getActiveUrgencySignals(): UrgencySignal[] {
  const signals: UrgencySignal[] = [];
  const activeTiers = getActiveTimeSensitiveTiers();
  
  for (const tier of activeTiers) {
    const countdown = generateCountdownMessage(tier.endDate);
    if (countdown.urgencyLevel !== 'low') {
      signals.push({
        ...countdown,
        message: `${countdown.message} - ${tier.displayName}`
      });
    }
    
    if (tier.maxPurchases && tier.currentPurchases >= tier.maxPurchases * 0.8) {
      signals.push(generateStockWarning(
        tier.maxPurchases - tier.currentPurchases,
        tier.maxPurchases
      ));
    }
  }
  
  for (const bundle of URGENCY_BUNDLES) {
    if (bundle.countdownEnd) {
      signals.push({
        type: 'countdown',
        message: `${generateCountdownMessage(bundle.countdownEnd).message} - ${bundle.name}`,
        urgencyLevel: generateCountdownMessage(bundle.countdownEnd).urgencyLevel,
        expiresAt: bundle.countdownEnd,
        actionRequired: bundle.urgencyMessage
      });
    }
    
    if (bundle.stockRemaining !== undefined && bundle.stockRemaining <= 20) {
      signals.push({
        type: 'stock_warning',
        message: `${bundle.stockRemaining} bundles remaining - ${bundle.name}`,
        urgencyLevel: bundle.stockRemaining <= 5 ? 'critical' : 'high',
        actionRequired: 'Claim your bundle now!'
      });
    }
  }
  
  return signals.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
  });
}

// =====================================================
// PRICE TRACKING & ANALYTICS
// =====================================================

const priceChangeHistory: PriceChangeEvent[] = [];

export function recordPriceChange(
  tierId: string,
  previousPrice: number,
  newPrice: number,
  reason: PriceChangeEvent['reason'],
  conversionRate: number,
  revenue: number
): PriceChangeEvent {
  const event: PriceChangeEvent = {
    id: `price_change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    tierId,
    previousPrice,
    newPrice,
    reason,
    conversionRate,
    revenue
  };
  priceChangeHistory.push(event);
  return event;
}

export function getPriceChangeHistory(tierId?: string): PriceChangeEvent[] {
  if (tierId) {
    return priceChangeHistory.filter(e => e.tierId === tierId);
  }
  return [...priceChangeHistory];
}

export function calculateUrgencyConversionMetrics(
  tierId: string,
  period: 'day' | 'week' | 'month'
): UrgencyConversionMetrics {
  const tier = TIME_SENSITIVE_TIERS.find(t => t.id === tierId);
  const now = new Date();
  let periodStart: Date;
  switch (period) {
    case 'day': periodStart = new Date(now.setDate(now.getDate() - 1)); break;
    case 'week': periodStart = new Date(now.setDate(now.getDate() - 7)); break;
    case 'month': periodStart = new Date(now.setDate(now.getDate() - 30)); break;
  }
  
  const relevantChanges = getPriceChangeHistory(tierId)
    .filter(e => e.timestamp >= periodStart);
  
  const totalViews = Math.floor(Math.random() * 5000) + 1000;
  const addToCarts = Math.floor(totalViews * 0.15);
  const checkouts = Math.floor(addToCarts * 0.4);
  const conversions = Math.floor(checkouts * 0.7);
  const conversionRate = conversions / totalViews;
  const avgTimeToPurchase = Math.floor(Math.random() * 30) + 5;
  
  return {
    tierId,
    period,
    views: totalViews,
    addToCarts,
    checkouts,
    conversions,
    conversionRate,
    avgTimeToPurchase,
    urgencyImpact: conversionRate > 0.05 ? 25 : 0,
    revenue: conversions * (tier?.currentPrice || 0),
    arpu: conversions > 0 ? (conversions * (tier?.currentPrice || 0)) / conversions : 0
  };
}

export function trackConversionFunnel(
  tierId: string,
  event: 'view' | 'add_to_cart' | 'checkout_start' | 'purchase',
  revenue?: number
): void {
  console.log(`[Urgency Analytics] ${tierId}: ${event}${revenue ? ` - $${revenue}` : ''}`);
}

// =====================================================
// CHECKOUT COUNTDOWN COMPONENT DATA
// =====================================================

export interface CheckoutCountdownConfig {
  duration: number;
  priceLock: boolean;
  discountGuaranteed: boolean;
  urgencyMessage: string;
}

export const CHECKOUT_COUNTDOWN_CONFIGS: Record<string, CheckoutCountdownConfig> = {
  standard: {
    duration: 15,
    priceLock: true,
    discountGuaranteed: true,
    urgencyMessage: 'Complete checkout to lock in your price!'
  },
  urgent: {
    duration: 10,
    priceLock: true,
    discountGuaranteed: true,
    urgencyMessage: 'Hurry! Price changes in:'
  },
  final: {
    duration: 5,
    priceLock: true,
    discountGuaranteed: true,
    urgencyMessage: 'Almost there! Finish checkout now:'
  }
};

export function getCheckoutCountdown(type: string = 'standard'): CheckoutCountdownConfig {
  return CHECKOUT_COUNTDOWN_CONFIGS[type] || CHECKOUT_COUNTDOWN_CONFIGS.standard;
}

export function formatCountdownTime(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.floor((minutes % 1) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =====================================================
// PRICING OPTIMIZATION
// =====================================================

export interface PricingRecommendation {
  tierId: string;
  currentPrice: number;
  recommendedPrice: number;
  expectedConversionLift: number;
  reason: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export function generatePricingRecommendation(
  tierId: string,
  currentConversionRate: number
): PricingRecommendation | null {
  const tier = TIME_SENSITIVE_TIERS.find(t => t.id === tierId);
  if (!tier) return null;

  const basePrice = tier.originalPrice;
  const currentPrice = tier.currentPrice;
  
  if (currentConversionRate < 0.03) {
    return {
      tierId,
      currentPrice,
      recommendedPrice: currentPrice * 0.9,
      expectedConversionLift: 15,
      reason: 'Low conversion rate suggests price is too high',
      urgencyLevel: 'high'
    };
  }
  
  if (currentConversionRate > 0.08) {
    return {
      tierId,
      currentPrice,
      recommendedPrice: currentPrice * 1.05,
      expectedConversionLift: -5,
      reason: 'High conversion rate suggests room for price increase',
      urgencyLevel: 'medium'
    };
  }
  
  return null;
}

// =====================================================
// EXPORTED UTILITY FUNCTIONS
// =====================================================

export function getTimeRemaining(endDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
} {
  const total = endDate.getTime() - new Date().getTime();
  
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
  }
  
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
    isExpired: false
  };
}

export function getPopularBundles(): UrgencyBundle[] {
  return URGENCY_BUNDLES.filter(b => b.popular);
}

export function getBestValueBundles(): UrgencyBundle[] {
  return URGENCY_BUNDLES.filter(b => b.bestValue);
}
