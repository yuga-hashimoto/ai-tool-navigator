// Subscription Manager
// Business logic for subscription management

import { PrismaClient, SubscriptionStatus, BillingType, BillingStatus, TrialStatus, ChangeType, ReminderStatus, ReminderType } from '@prisma/client';
import { 
  createSubscription, 
  getSubscription, 
  updateSubscription as stripeUpdateSubscription,
  cancelSubscription as stripeCancelSubscription,
  createCheckoutSession,
  createPortalSession,
  createCustomerPortalSession,
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
      subscriptionPlans: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
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
      subscriptionPlans: {
        where: { isActive: true },
      },
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
      subscriptionPlans: true,
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
      limits: data.limits ? JSON.stringify(data.limits) : null,
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
      limits: data.limits ? JSON.stringify(data.limits) : null,
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
  return prisma.userSubscription.findFirst({
    where: { userId },
    include: {
      tier: true,
      billingHistory: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * Get all subscriptions for admin
 */
export async function getAllSubscriptions(options?: {
  status?: SubscriptionStatus;
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
  
  return prisma.userSubscription.findMany({
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
  const subscription = await prisma.userSubscription.create({
    data: {
      userId: data.userId,
      email: data.email,
      stripeCustomerId: customerId,
      tierId: data.tierId,
      status: trialDays > 0 ? SubscriptionStatus.TRIALING : SubscriptionStatus.INACTIVE,
      isTrial: trialDays > 0,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { tier: true },
  });
  
  // Create trial record if applicable
  if (trialDays > 0) {
    await prisma.freeTrial.create({
      data: {
        userId: data.userId,
        email: data.email,
        tierId: data.tierId,
        endsAt: trialEndsAt!,
        status: TrialStatus.ACTIVE,
      },
    });
    
    // Schedule trial expiration reminder
    await scheduleRenewalReminder({
      subscriptionId: subscription.id,
      userId: data.userId,
      type: ReminderType.TRIAL_EXPIRING,
      daysBefore: 3,
    });
  }
  
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
  const subscription = await prisma.userSubscription.findUnique({
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
    ? ChangeType.UPGRADE
    : ChangeType.DOWNGRADE;
  
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
  
  // Log the change
  await prisma.upgradeDowngradeLog.create({
    data: {
      subscriptionId,
      userId: subscription.userId,
      fromTierId: subscription.tierId,
      toTierId: newTierId,
      changeType,
      effectiveDate: new Date(),
      stripeInvoiceId: updatedSubscription.latest_invoice as string || null,
    },
  });
  
  // Update local subscription
  const updated = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      tierId: newTierId,
      stripePriceId,
      status: mapStripeStatus(updatedSubscription.status) as SubscriptionStatus,
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
    },
    include: { tier: true },
  });
  
  // Record billing history
  await prisma.billingHistory.create({
    data: {
      subscriptionId,
      userId: subscription.userId,
      email: subscription.email,
      amount: newTier.price - subscription.tier.price,
      type: changeType === ChangeType.UPGRADE ? BillingType.UPGRADE : BillingType.DOWNGRADE,
      status: BillingStatus.SUCCEEDED,
      description: `${changeType} from ${subscription.tier.name} to ${newTier.name}`,
    },
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
  const subscription = await prisma.userSubscription.findUnique({
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
  const updated = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd,
      canceledAt: cancelAtPeriodEnd ? null : new Date(),
    },
  });
  
  // Log the cancellation
  await prisma.upgradeDowngradeLog.create({
    data: {
      subscriptionId,
      userId: subscription.userId,
      fromTierId: subscription.tierId,
      changeType: ChangeType.CANCELLATION,
      effectiveDate: new Date(),
    },
  });
  
  // Schedule win-back reminder if canceling at period end
  if (cancelAtPeriodEnd) {
    await scheduleRenewalReminder({
      subscriptionId,
      userId: subscription.userId,
      type: ReminderType.WINBACK,
      daysBefore: 7,
    });
  }
  
  return updated;
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
  });
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  // Reactivation logic would go here
  // This depends on your Stripe setup
  
  return prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Preview subscription change (upgrade/downgrade costs)
 */
export async function previewTierChange(subscriptionId: string, newTierId: string) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
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
  
  const plan = tier.subscriptionPlans.find(
    p => p.billingCycle === (data.billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY')
  );
  
  const priceId = plan?.stripePriceId || tier.stripePriceId;
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
  
  // Store portal session
  await prisma.portalSession.create({
    data: {
      userId,
      stripePortalUrl: session.url,
      stripePortalSession: session.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  
  return session.url;
}

// =====================================================
// BILLING HISTORY
// =====================================================

/**
 * Get billing history for user
 */
export async function getBillingHistory(userId: string, limit: number = 20) {
  return prisma.billingHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get invoices for user
 */
export async function getInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// =====================================================
// TRIAL MANAGEMENT
// =====================================================

/**
 * Get user's trial status
 */
export async function getTrialStatus(userId: string) {
  return prisma.freeTrial.findUnique({
    where: { userId },
    include: { tier: true },
  });
}

/**
 * Convert trial to paid subscription
 */
export async function convertTrial(subscriptionId: string, paymentMethodId?: string) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
    include: { tier: true },
  });
  
  if (!subscription || !subscription.isTrial) {
    throw new Error('No trial subscription found');
  }
  
  // Update trial record
  await prisma.freeTrial.update({
    where: { userId: subscription.userId },
    data: {
      convertedAt: new Date(),
      convertedToTierId: subscription.tierId,
      status: TrialStatus.CONVERTED,
    },
  });
  
  // Update subscription status
  return prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      isTrial: false,
      status: SubscriptionStatus.ACTIVE,
      trialEndsAt: null,
    },
  });
}

/**
 * Get all active trials (for admin)
 */
export async function getActiveTrials() {
  return prisma.freeTrial.findMany({
    where: { status: TrialStatus.ACTIVE },
    include: { tier: true },
    orderBy: { endsAt: 'asc' },
  });
}

/**
 * Expire trials (called by scheduler)
 */
export async function expireTrials() {
  const now = new Date();
  
  // Find expired trials
  const expiredTrials = await prisma.freeTrial.findMany({
    where: {
      status: TrialStatus.ACTIVE,
      endsAt: { lt: now },
    },
  });
  
  // Update each expired trial
  for (const trial of expiredTrials) {
    await prisma.freeTrial.update({
      where: { id: trial.id },
      data: { status: TrialStatus.EXPIRED },
    });
    
    // Update associated subscription
    await prisma.userSubscription.updateMany({
      where: { userId: trial.userId, isTrial: true },
      data: {
        status: SubscriptionStatus.CANCELED,
        isTrial: false,
      },
    });
    
    // Send expiration notification
    await scheduleRenewalReminder({
      subscriptionId: '',
      userId: trial.userId,
      type: ReminderType.TRIAL_EXPIRED,
      daysBefore: 0,
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
  type: ReminderType;
  daysBefore: number;
}) {
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + data.daysBefore);
  
  return prisma.renewalReminder.create({
    data: {
      subscriptionId: data.subscriptionId,
      userId: data.userId,
      reminderType: data.type,
      scheduledFor: reminderDate,
      status: ReminderStatus.PENDING,
      channel: 'email',
    },
  });
}

/**
 * Get pending reminders (for scheduler)
 */
export async function getPendingReminders() {
  return prisma.renewalReminder.findMany({
    where: {
      status: ReminderStatus.PENDING,
      scheduledFor: { lte: new Date() },
    },
    take: 100,
  });
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(reminderId: string, messageId?: string) {
  return prisma.renewalReminder.update({
    where: { id: reminderId },
    data: {
      status: ReminderStatus.SENT,
      sentAt: new Date(),
      messageId,
    },
  });
}

/**
 * Cancel pending reminders for subscription
 */
export async function cancelReminders(subscriptionId: string, types?: ReminderType[]) {
  const where: Record<string, unknown> = {
    subscriptionId,
    status: ReminderStatus.PENDING,
  };
  
  if (types) {
    where.reminderType = { in: types };
  }
  
  return prisma.renewalReminder.updateMany({
    where,
    data: { status: ReminderStatus.CANCELED },
  });
}

// =====================================================
// USAGE TRACKING
// =====================================================

/**
 * Get usage for subscription
 */
export async function getUsage(subscriptionId: string, featureKey: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return prisma.usageRecord.findFirst({
    where: {
      subscriptionId,
      featureKey,
      periodStart,
      periodEnd,
    },
  });
}

/**
 * Increment usage
 */
export async function incrementUsage(subscriptionId: string, featureKey: string, limit?: number) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Upsert usage record
  const usage = await prisma.usageRecord.upsert({
    where: {
      subscriptionId_featureKey_periodStart: {
        subscriptionId,
        featureKey,
        periodStart,
      },
    },
    update: {
      usageCount: { increment: 1 },
    },
    create: {
      subscriptionId,
      featureKey,
      usageCount: 1,
      usageLimit: limit,
      periodStart,
      periodEnd,
    },
  });
  
  // Check if limit exceeded
  if (limit && usage.usageCount > limit) {
    // Could trigger webhook or notification here
    return { ...usage, exceeded: true };
  }
  
  return { ...usage, exceeded: false };
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
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
    },
    include: { tier: true },
  });
  
  // Calculate metrics
  const activeSubscriptions = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
  const trialSubscriptions = subscriptions.filter(s => s.status === SubscriptionStatus.TRIALING);
  
  const mrr = activeSubscriptions.reduce((sum, s) => sum + s.tier.price, 0);
  const arr = mrr * 12;
  const arpu = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;
  
  // Get today's new subscriptions
  const todayNewSubscriptions = await prisma.userSubscription.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });
  
  // Get today's cancellations
  const todayCancellations = await prisma.upgradeDowngradeLog.count({
    where: {
      changeType: ChangeType.CANCELLATION,
      createdAt: { gte: startOfDay, lte: endOfDay },
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
  const analytics = await getSubscriptionAnalytics();
  
  return prisma.subscriptionAnalytics.create({
    data: {
      date: analytics.date,
      mrr: analytics.mrr,
      arr: analytics.arr,
      newSubscriptions: analytics.newSubscriptions,
      cancellations: analytics.cancellations,
      churnRate: analytics.churnRate,
      netRevenue: analytics.mrr,
      activeSubscriptions: analytics.activeSubscriptions,
      activeTrials: analytics.activeTrials,
      totalUsers: analytics.totalUsers,
      arpu: analytics.arpu,
    },
  });
}

/**
 * Get MRR history
 */
export async function getMRRHistory(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return prisma.subscriptionAnalytics.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });
}

/**
 * Get revenue by tier
 */
export async function getRevenueByTier() {
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
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
  return prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
}

/**
 * Validate coupon
 */
export async function validateCoupon(code: string, tierId?: string) {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, error: 'Coupon not found' };
  }
  
  if (!coupon.isActive) {
    return { valid: false, error: 'Coupon is no longer active' };
  }
  
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: 'Coupon has expired' };
  }
  
  if (coupon.maxRedemptions && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { valid: false, error: 'Coupon has reached max redemptions' };
  }
  
  if (coupon.startsAt && coupon.startsAt > new Date()) {
    return { valid: false, error: 'Coupon is not yet active' };
  }
  
  // Check tier restrictions
  if (tierId && coupon.appliesTo !== 'all') {
    const excludedTiers = coupon.excludedTierIds 
      ? JSON.parse(coupon.excludedTierIds) 
      : [];
    if (excludedTiers.includes(tierId)) {
      return { valid: false, error: 'Coupon not valid for this tier' };
    }
  }
  
  return { 
    valid: true, 
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      duration: coupon.duration,
      durationInMonths: coupon.durationInMonths,
    },
  };
}

/**
 * Redeem coupon
 */
export async function redeemCoupon(code: string) {
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    throw new Error('Coupon not found');
  }
  
  return prisma.coupon.update({
    where: { id: coupon.id },
    data: { timesRedeemed: { increment: 1 } },
  });
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
