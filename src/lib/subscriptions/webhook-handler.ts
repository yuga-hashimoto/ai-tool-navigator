// Stripe Webhook Handler
// Processes Stripe webhook events for subscription updates
// Refactored to use enhanced security module (Issue #931)

import Stripe from 'stripe';
import { 
  mapStripeStatus,
} from './stripe-service';
import {
  verifyWebhookSignature,
  getWebhookSigningSecret,
  type WebhookVerificationResult,
} from '../stripe/webhook-security';
import { PrismaClient } from '@prisma/client';

type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' | 'PAUSED' | 'INACTIVE';
type BillingType = 'MONTHLY' | 'YEARLY' | 'ONE_TIME' | 'TRIAL_CONVERSION' | 'RENEWAL' | 'SUBSCRIPTION' | 'UPGRADE' | 'DOWNGRADE';
type BillingStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'FAILED' | 'SUCCEEDED';
type TrialStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'CONVERTED';
// import { updateUserSubscriptionFromWebhook } from './subscription-manager';
// TODO: Implement updateUserSubscriptionFromWebhook function

const prisma = new PrismaClient();

// ================================================================
// WEBHOOK HANDLER (with enhanced security)
// ================================================================

export async function handleStripeWebhook(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  // Use the enhanced webhook security module for verification
  const signingSecret = getWebhookSigningSecret();
  const verificationResult: WebhookVerificationResult = await verifyWebhookSignature(
    body,
    signature,
    {
      signingSecret,
      timestampToleranceSeconds: 300,
      enableReplayPrevention: true,
      enableAuditLog: true,
    },
    request.headers.get('x-forwarded-for') || undefined
  );

  if (!verificationResult.success) {
    console.error('Webhook verification failed:', verificationResult.error);
    const statusCode = verificationResult.errorCode === 'REPLAY_DETECTED' ? 409 : 400;
    return new Response(
      JSON.stringify({
        error: verificationResult.error,
        code: verificationResult.errorCode,
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const event = verificationResult.event!;
  
  try {
    await processWebhookEvent(event);
    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}

// ================================================================
// EVENT PROCESSING
// ================================================================

async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    // Subscription events
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object as Stripe.Subscription);
      break;
      
    // Invoice events
    case 'invoice.created':
      await handleInvoiceCreated(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
      
    // Checkout events
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// ================================================================
// SUBSCRIPTION HANDLERS
// ================================================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;

  console.log(`Subscription created: ${subscription.id} for customer ${customerId}`);
  
  try {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (!user) {
      console.error(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    const status = mapStripeStatus(subscription.status) as SubscriptionStatus;
    const priceId = subscription.items.data[0]?.price?.id;
    
    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: {
        status,
        stripePriceId: priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;

  console.log(`Subscription updated: ${subscription.id} for customer ${customerId}`);
  
  try {
    const status = mapStripeStatus(subscription.status) as SubscriptionStatus;
    const priceId = subscription.items.data[0]?.price?.id;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status,
        stripePriceId: priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);
  
  try {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELLED' as SubscriptionStatus,
        cancelledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;

  console.log(`Trial ending soon for subscription: ${subscription.id}, customer: ${customerId}`);
  
  // TODO: Send trial ending notification email
  // TODO: Update trial status in database
}

// ================================================================
// INVOICE HANDLERS
// ================================================================

async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;

  console.log(`Invoice created: ${invoice.id} for customer ${customerId}`);
  
  try {
    if (!customerId) return;
    
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (!user) {
      console.error(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    await prisma.billingHistory.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'PENDING' as BillingStatus,
        type: 'SUBSCRIPTION' as BillingType,
        description: invoice.description || `Invoice ${invoice.number}`,
      },
    });
  } catch (error) {
    console.error('Error handling invoice created:', error);
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`Invoice paid: ${invoice.id}`);
  
  try {
    await prisma.billingHistory.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'PAID' as BillingStatus,
        paidAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling invoice paid:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;

  console.log(`Invoice payment failed: ${invoice.id} for customer ${customerId}`);
  
  try {
    await prisma.billingHistory.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'FAILED' as BillingStatus,
      },
    });
    
    // TODO: Send payment failure notification email
    // TODO: Implement retry logic or grace period
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}

// ================================================================
// CHECKOUT HANDLER
// ================================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = typeof session.customer === 'string' 
    ? session.customer 
    : session.customer?.id;

  console.log(`Checkout completed: ${session.id} for customer ${customerId}`);
  
  try {
    if (!customerId) return;
    
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    });

    if (!user) {
      console.error(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    // Update user's subscription status based on checkout session
    if (session.subscription) {
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;
        
      console.log(`Checkout created subscription: ${subscriptionId} for user: ${user.id}`);
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}
