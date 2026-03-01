// Stripe Subscription Service
// Complete Stripe integration for recurring billing

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// =====================================================
// CUSTOMER MANAGEMENT
// =====================================================

/**
 * Create a new Stripe customer
 */
export async function createStripeCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      ...metadata,
      source: 'subscription-system',
    },
  });
  
  return customer;
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateStripeCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  // Check if customer exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });
  
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }
  
  // Create new customer
  return await createStripeCustomer(email, name, metadata);
}

/**
 * Update Stripe customer
 */
export async function updateStripeCustomer(customerId: string, data: Stripe.CustomerUpdateParams) {
  return await stripe.customers.update(customerId, data);
}

/**
 * Get Stripe customer
 */
export async function getStripeCustomer(customerId: string) {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    return null;
  }
}

// =====================================================
// SUBSCRIPTION MANAGEMENT
// =====================================================

/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number,
  metadata?: Record<string, string>
) {
  const subscriptionData: Stripe.SubscriptionCreateParams = {
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      ...metadata,
      source: 'subscription-system',
    },
  };
  
  if (trialDays && trialDays > 0) {
    subscriptionData.trial_period_days = trialDays;
  }
  
  const subscription = await stripe.subscriptions.create(subscriptionData);
  
  return subscription;
}

/**
 * Get subscription
 */
export async function getSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent', 'items.data.price.product'],
    });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Update subscription (e.g., change price/tier)
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string,
  prorationBehavior: 'create_prorations' | 'none' | 'always_invoice' = 'create_prorations'
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: prorationBehavior,
  });
  
  return updatedSubscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
) {
  if (cancelAtPeriodEnd) {
    // Cancel at end of billing period (user keeps access until then)
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    // Cancel immediately
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Pause subscription
 */
export async function pauseSubscription(
  subscriptionId: string,
  resumeDate?: Date
) {
  const pauseData: Stripe.SubscriptionUpdateParams.PauseCollection = {
    behavior: 'mark_uncollectible',
  };
  
  if (resumeDate) {
    pauseData.resumes_at = Math.floor(resumeDate.getTime() / 1000);
  }
  
  return await stripe.subscriptions.update(subscriptionId, {
    pause_collection: pauseData,
  });
}

/**
 * Resume paused subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    pause_collection: '',
  });
}

// =====================================================
// CHECKOUT & PORTAL
// =====================================================

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  trialDays?: number,
  couponId?: string,
  metadata?: Record<string, string>
) {
  const sessionData: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...metadata,
      source: 'subscription-checkout',
    },
  };
  
  if (trialDays && trialDays > 0) {
    sessionData.subscription_data = {
      trial_period_days: trialDays,
    };
  }
  
  if (couponId) {
    sessionData.discounts = [{ coupon: couponId }];
  }
  
  const session = await stripe.checkout.sessions.create(sessionData, {
    idempotencyKey: `${customerId}-${priceId}-${Date.now()}`,
  });
  
  return session;
}

/**
 * Create customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session;
}

/**
 * Get existing checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items'],
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
}

// =====================================================
// PAYMENT METHODS
// =====================================================

/**
 * Get customer's payment methods
 */
export async function getPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  
  return paymentMethods.data;
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  // Set as default for invoices
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
  
  // Also attach to customer if not already attached
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
}

/**
 * Detach payment method
 */
export async function detachPaymentMethod(paymentMethodId: string) {
  return await stripe.paymentMethods.detach(paymentMethodId);
}

/**
 * Create setup intent for adding payment method
 */
export async function createSetupIntent(customerId: string) {
  return await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
}

// =====================================================
// INVOICES & PAYMENTS
// =====================================================

/**
 * Get invoices for customer
 */
export async function getInvoices(customerId: string, limit: number = 10) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });
  
  return invoices.data;
}

/**
 * Get upcoming invoice
 */
export async function getUpcomingInvoice(customerId: string) {
  try {
    return await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    });
  } catch (error) {
    return null;
  }
}

/**
 * Preview subscription change (upgrade/downgrade)
 */
export async function previewSubscriptionChange(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const prorationDate = Math.floor(Date.now() / 1000);
  
  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: subscription.customer as string,
    subscription: subscriptionId,
    subscription_items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
  
  return {
    invoice,
    prorationAmount: invoice.amount_due / 100, // Convert from cents
  };
}

/**
 * Pay invoice manually
 */
export async function payInvoice(invoiceId: string, paymentMethodId?: string) {
  return await stripe.invoices.pay(invoiceId, {
    payment_method: paymentMethodId,
  });
}

/**
 * Void invoice
 */
export async function voidInvoice(invoiceId: string) {
  return await stripe.invoices.voidInvoice(invoiceId);
}

// =====================================================
// COUPONS & DISCOUNTS
// =====================================================

/**
 * Create Stripe coupon
 */
export async function createCoupon(
  duration: 'once' | 'repeating' | 'forever',
  discountType: 'percent' | 'fixed',
  discountValue: number,
  durationInMonths?: number,
  maxRedemptions?: number
) {
  const couponData: Stripe.CouponCreateParams = {
    duration,
    [discountType === 'percent' ? 'percent_off' : 'amount_off']: discountValue,
    currency: 'usd',
  };
  
  if (duration === 'repeating' && durationInMonths) {
    couponData.duration_in_months = durationInMonths;
  }
  
  if (maxRedemptions) {
    couponData.max_redemptions = maxRedemptions;
  }
  
  return await stripe.coupons.create(couponData);
}

/**
 * Get coupon by code
 */
export async function getCoupon(couponId: string) {
  try {
    return await stripe.coupons.retrieve(couponId);
  } catch (error) {
    return null;
  }
}

/**
 * Delete coupon
 */
export async function deleteCoupon(couponId: string) {
  try {
    return await stripe.coupons.del(couponId);
  } catch (error) {
    return null;
  }
}

/**
 * Apply coupon to subscription
 */
export async function applyCouponToSubscription(subscriptionId: string, couponId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    coupon: couponId,
  });
}

// =====================================================
// WEBHOOK HANDLING
// =====================================================

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Map Stripe subscription status to our status
 */
export function mapStripeStatus(status: Stripe.Subscription.Status) {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    trialing: 'TRIALING',
    paused: 'PAUSED',
    incomplete: 'INACTIVE',
    incomplete_expired: 'CANCELED',
  };
  
  return statusMap[status] || 'INACTIVE';
}

// =====================================================
// PRODUCTS & PRICES
// =====================================================

/**
 * Create product in Stripe
 */
export async function createProduct(name: string, description?: string) {
  return await stripe.products.create({
    name,
    description,
  });
}

/**
 * Create price for product
 */
export async function createPrice(
  productId: string,
  unitAmount: number,
  currency: string = 'usd',
  recurringInterval: 'month' | 'year' = 'month'
) {
  return await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring: {
      interval: recurringInterval,
    },
  });
}

/**
 * Get product
 */
export async function getProduct(productId: string) {
  try {
    return await stripe.products.retrieve(productId);
  } catch (error) {
    return null;
  }
}

/**
 * Get price
 */
export async function getPrice(priceId: string) {
  try {
    return await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });
  } catch (error) {
    return null;
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate MRR from active subscriptions
 */
export function calculateMRR(subscriptions: Array<{ price: number; status: string }>): number {
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => total + sub.price, 0);
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get price ID from tier configuration
 */
export async function getPriceIdForTier(
  tierSlug: string,
  billingCycle: 'monthly' | 'yearly'
): Promise<string | null> {
  // This would typically be a database lookup
  // For now, return null and let the calling function handle it
  return null;
}

export default stripe;
