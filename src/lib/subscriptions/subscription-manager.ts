// Subscription Manager
// Business logic for subscription management

import { PrismaClient } from '@prisma/client';
import { 
  createSubscription, 
  getSubscription, 
  updateSubscription as stripeUpdateSubscription,
  cancelSubscription as stripeCancelSubscription,
  createCheckoutSession,
  createPortalSession,
  mapStripeStatus,
  previewSubscriptionChange,
  createStripeCustomer,
} from './stripe-service';

const prisma = new PrismaClient();

// =====================================================
// TIER MANAGEMENT
// =====================================================

/**
 * Get all active subscription tiers
 */
export async function getSubscriptionTiers() {
  return prisma.subscriptionTier.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      subscriptions: true
    },
  });
}

/**
 * Get tier by slug
 */
export async function getTierBySlug(slug: string) {
  return prisma.subscriptionTier.findUnique({
    where: { slug },
    include: {
      subscriptions: true
    },
  });
}

/**
 * Get tier by ID
 */
export async function getTierById(id: string) {
  return prisma.subscriptionTier.findUnique({
    where: { id },
    include: {
      subscriptions: true,
    },
  });
}

/**
 * Create or update subscription tier
 */
export async function upsertSubscriptionTier(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  priceYearly?: number;
  features?: string[];
  limits?: Record<string, number>;
  isPopular?: boolean;
  trialDays?: number;
  sortOrder?: number;
}) {
  return prisma.subscriptionTier.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      price: data.price,
      priceYearly: data.priceYearly,
      features: data.features ? JSON.stringify(data.features) : null,
      isPopular: data.isPopular ?? false,
      trialDays: data.trialDays ?? 0,
      sortOrder: data.sortOrder ?? 0,
    },
    create: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      priceYearly: data.priceYearly,
      features: data.features ? JSON.stringify(data.features) : null,
      isPopular: data.isPopular ?? false,
      trialDays: data.trialDays ?? 0,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

// =====================================================
// SUBSCRIPTION OPERATIONS
// =====================================================

/**
 * Get user subscription
 */
export async function getUserSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId },
    include: {
      tier: true,
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get all subscriptions for admin
 */
export async function getAllSubscriptions(options?: {
  status?: string;
  tierId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  
  if (options?.status) {
    where.status = options.status;
  }
  if (options?.tierId) {
    where.tierId = options.tierId;
  }
  
  return prisma.subscription.findMany({
    where,
    include: {
      tier: true,
    },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Create new subscription
 */
export async function createUserSubscription(data: {
  userId: string;
  email: string;
  tierId: string;
  stripeCustomerId?: string;
  isTrial?: boolean;
  trialDays?: number;
}) {
  // Get tier info
  const tier = await getTierById(data.tierId);
  if (!tier) {
    throw new Error('Subscription tier not found');
  }
  
  // Get or create Stripe customer
  const customerId = data.stripeCustomerId || 
    (await createStripeCustomer(data.email)).id;
  
  // Calculate dates
  const now = new Date();
  const trialDays = data.isTrial ? (data.trialDays ?? tier.trialDays ?? 14) : 0;
  const trialEndsAt = trialDays > 0 
    ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) 
    : null;
  
  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: data.userId,
      stripeCustomerId: customerId,
      tierId: data.tierId,
      status: trialDays > 0 ? 'TRIALING' : 'INACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { tier: true },
  });
  
  // Trial record logic would go here if FreeTrial model existed
  // Reminder logic would go here if Reminder model existed
  
  return subscription;
}

/**
 * Upgrade or downgrade subscription
 */
export async function changeSubscriptionTier(
  subscriptionId: string,
  newTierId: string,
  prorate: boolean = true
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { tier: true },
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  const newTier = await getTierById(newTierId);
  if (!newTier) {
    throw new Error('New tier not found');
  }
  
  // Determine change type
  const changeType = newTier.price > subscription.tier.price 
    ? 'UPGRADE'
    : 'DOWNGRADE';
  
  // Create Stripe subscription update
  const stripePriceId = newTier.stripePriceId;
  if (!stripePriceId) {
    throw new Error('Stripe price ID not configured for tier');
  }
  
  const updatedSubscription = await stripeUpdateSubscription(
    subscription.stripeSubscriptionId!,
    stripePriceId,
    prorate ? 'create_prorations' : 'none'
  );
  
  // Update local subscription
  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      tierId: newTierId,
      status: mapStripeStatus(updatedSubscription.status),
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
    },
    include: { tier: true },
  });
  
  return updated;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { tier: true },
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  // Cancel in Stripe
  if (subscription.stripeSubscriptionId) {
    await stripeCancelSubscription(
      subscription.stripeSubscriptionId,
      cancelAtPeriodEnd
    );
  }
  
  // Update local subscription
  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED',
      cancelAtPeriodEnd,
      canceledAt: cancelAtPeriodEnd ? null : new Date(),
    },
  });
  
  return updated;
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  // Reactivation logic would go here
  // This depends on your Stripe setup
  
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Preview subscription change (upgrade/downgrade costs)
 */
export async function previewTierChange(subscriptionId: string, newTierId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { tier: true },
  });
  
  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new Error('Subscription not found');
  }
  
  const newTier = await getTierById(newTierId);
  if (!newTier || !newTier.stripePriceId) {
    throw new Error('New tier not found');
  }
  
  const preview = await previewSubscriptionChange(
    subscription.stripeSubscriptionId,
    newTier.stripePriceId
  );
  
  return {
    prorationAmount: preview.prorationAmount,
    newMonthlyPrice: newTier.price,
    changeType: newTier.price > subscription.tier.price ? 'upgrade' : 'downgrade',
  };
}

// =====================================================
// CHECKOUT & PORTAL
// =====================================================

/**
 * Generate checkout session URL
 */
export async function generateCheckoutUrl(data: {
  userId: string;
  email: string;
  tierId: string;
  billingCycle: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
  couponCode?: string;
}) {
  const tier = await getTierById(data.tierId);
  if (!tier) {
    throw new Error('Tier not found');
  }
  
  const priceId = data.billingCycle === 'yearly' && tier.stripeYearlyPriceId
    ? tier.stripeYearlyPriceId
    : tier.stripePriceId;
  if (!priceId) {
    throw new Error('Stripe price not configured');
  }
  
  // Get or create Stripe customer
  const customer = await createStripeCustomer(data.email);
  
  // Create checkout session
  const session = await createCheckoutSession(
    customer.id,
    priceId,
    data.successUrl,
    data.cancelUrl,
    tier.trialDays > 0 ? tier.trialDays : undefined,
    data.couponCode
  );
  
  return session.url;
}

/**
 * Generate customer portal URL
 */
export async function generatePortalUrl(userId: string, returnUrl: string) {
  const subscription = await getUserSubscription(userId);
  if (!subscription?.stripeCustomerId) {
    throw new Error('No subscription or customer ID found');
  }
  
  const session = await createPortalSession(
    subscription.stripeCustomerId,
    returnUrl
  );
  
  // No portalSession table exists, returning URL directly
  return session.url;
}

// =====================================================
// BILLING HISTORY
// =====================================================

/**
 * Get billing history for user
 */
export async function getBillingHistory(userId: string, limit: number = 20) {
  return []; // Placeholder: not implemented in schema
}

/**
 * Get invoices for user
 */
export async function getInvoices(userId: string) {
  return []; // Placeholder: not implemented in schema
}

// =====================================================
// TRIAL MANAGEMENT
// =====================================================

/**
 * Get user's trial status
 */
export async function getTrialStatus(userId: string) {
  // Placeholder: not implemented in schema
  return null;
}

/**
 * Convert trial to paid subscription
 */
export async function convertTrial(subscriptionId: string, paymentMethodId?: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { tier: true },
  });
  
  if (!subscription || subscription.status !== 'TRIALING') {
    throw new Error('No trial subscription found');
  }
  
  // Update subscription status
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
    },
  });
}

/**
 * Get all active trials (for admin)
 */
export async function getActiveTrials() {
  return prisma.subscription.findMany({
    where: { status: 'TRIALING' },
    include: { tier: true },
  });
}

/**
 * Expire trials (called by scheduler)
 */
export async function expireTrials() {
  const now = new Date();
  
  // Find expired trials
  const expiredTrials = await prisma.subscription.findMany({
    where: {
      status: 'TRIALING',
      currentPeriodEnd: { lt: now },
    },
  });
  
  // Update each expired trial
  for (const trial of expiredTrials) {
    // Update associated subscription
    await prisma.subscription.update({
      where: { id: trial.id },
      data: {
        status: 'CANCELED',
      },
    });
  }
  
  return expiredTrials.length;
}

// =====================================================
// RENEWAL REMINDERS
// =====================================================

/**
 * Schedule renewal reminder
 */
async function scheduleRenewalReminder(data: {
  subscriptionId: string;
  userId: string;
  type: string;
  daysBefore: number;
}) {
  // Placeholder: not implemented in schema
  return null;
}

/**
 * Get pending reminders (for scheduler)
 */
export async function getPendingReminders() {
  // Placeholder: not implemented in schema
  return [];
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(reminderId: string, messageId?: string) {
  // Placeholder: not implemented in schema
  return null;
}

/**
 * Cancel pending reminders for subscription
 */
export async function cancelReminders(subscriptionId: string, types?: string[]) {
  // Placeholder: not implemented in schema
  return null;
}

// =====================================================
// USAGE TRACKING
// =====================================================

/**
 * Get usage for subscription
 */
export async function getUsage(subscriptionId: string, featureKey: string) {
  // Placeholder: not implemented in schema
  return null;
}

/**
 * Increment usage
 */
export async function incrementUsage(subscriptionId: string, featureKey: string, limit?: number) {
  // Placeholder: not implemented in schema
  return null;
}

// =====================================================
// ANALYTICS
// =====================================================

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics(date?: Date) {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
  // Get all subscriptions with their tiers
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: { in: ['ACTIVE', 'TRIALING'] },
    },
    include: { tier: true },
  });
  
  // Calculate metrics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE');
  const trialSubscriptions = subscriptions.filter(s => s.status === 'TRIALING');
  
  const mrr = activeSubscriptions.reduce((sum, s) => sum + s.tier.price, 0);
  const arr = mrr * 12;
  const arpu = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;
  
  // Get today's new subscriptions
  const todayNewSubscriptions = await prisma.subscription.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });
  
  // Get today's cancellations
  // using basic approximation since log table doesn't exist
  const todayCancellations = await prisma.subscription.count({
    where: {
      status: 'CANCELED',
      updatedAt: { gte: startOfDay, lte: endOfDay },
    },
  });
  
  // Calculate churn rate
  const totalSubscriptions = activeSubscriptions.length + trialSubscriptions.length;
  const churnRate = totalSubscriptions > 0 
    ? (todayCancellations / totalSubscriptions) * 100 
    : 0;
  
  return {
    date: targetDate,
    mrr,
    arr,
    activeSubscriptions: activeSubscriptions.length,
    activeTrials: trialSubscriptions.length,
    totalUsers: totalSubscriptions,
    newSubscriptions: todayNewSubscriptions,
    cancellations: todayCancellations,
    churnRate,
    arpu,
    trialConversionRate: trialSubscriptions.length > 0 
      ? (todayNewSubscriptions / trialSubscriptions.length) * 100 
      : 0,
  };
}

/**
 * Record daily analytics
 */
export async function recordDailyAnalytics() {
  // Placeholder: not implemented in schema
  const analytics = await getSubscriptionAnalytics();
  return analytics;
}

/**
 * Get MRR history
 */
export async function getMRRHistory(days: number = 30) {
  // Placeholder: not implemented in schema
  return [];
}

/**
 * Get revenue by tier
 */
export async function getRevenueByTier() {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: { tier: true },
  });
  
  const tierRevenue: Record<string, { count: number; revenue: number }> = {};
  
  for (const sub of subscriptions) {
    const tierName = sub.tier.name;
    if (!tierRevenue[tierName]) {
      tierRevenue[tierName] = { count: 0, revenue: 0 };
    }
    tierRevenue[tierName].count++;
    tierRevenue[tierName].revenue += sub.tier.price;
  }
  
  return tierRevenue;
}

// =====================================================
// COUPONS
// =====================================================

/**
 * Get coupon by code
 */
export async function getCouponByCode(code: string) {
  // Placeholder: not implemented in schema
  return null;
}

/**
 * Validate coupon
 */
export async function validateCoupon(code: string, tierId?: string): Promise<{ valid: boolean; error?: string; coupon?: any }> {
  // Placeholder: not implemented in schema
  return { valid: false, error: 'Coupons not implemented' };
}

/**
 * Redeem coupon
 */
export async function redeemCoupon(code: string) {
  // Placeholder: not implemented in schema
  return null;
}

export default {
  getSubscriptionTiers,
  getTierBySlug,
  getTierById,
  upsertSubscriptionTier,
  getUserSubscription,
  getAllSubscriptions,
  createUserSubscription,
  changeSubscriptionTier,
  cancelSubscription,
  reactivateSubscription,
  previewTierChange,
  generateCheckoutUrl,
  generatePortalUrl,
  getBillingHistory,
  getInvoices,
  getTrialStatus,
  convertTrial,
  getActiveTrials,
  expireTrials,
  getPendingReminders,
  markReminderSent,
  getUsage,
  incrementUsage,
  getSubscriptionAnalytics,
  recordDailyAnalytics,
  getMRRHistory,
  getRevenueByTier,
  validateCoupon,
  redeemCoupon,
};
