// Stripe Webhook Handler
// Processes Stripe webhook events for subscription updates

import { headers } from 'next/headers';
import Stripe from 'stripe';
import { 
  constructWebhookEvent, 
  mapStripeStatus,
} from './stripe-service';
import { PrismaClient } from '@prisma/client';

type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' | 'PAUSED' | 'INACTIVE';
type BillingType = 'MONTHLY' | 'YEARLY' | 'ONE_TIME' | 'TRIAL_CONVERSION' | 'RENEWAL' | 'SUBSCRIPTION' | 'UPGRADE' | 'DOWNGRADE';
type BillingStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'FAILED' | 'SUCCEEDED';
type TrialStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'CONVERTED';
// import { updateUserSubscriptionFromWebhook } from './subscription-manager';
// TODO: Implement updateUserSubscriptionFromWebhook function

const prisma = new PrismaClient();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// =====================================================
// WEBHOOK HANDLER
// =====================================================

export async function handleStripeWebhook(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }
  
  let event: Stripe.Event;
  
  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  
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

// =====================================================
// EVENT PROCESSING
// =====================================================

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
      
    case 'invoice.finalized':
      await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
      break;
      
    // Checkout events
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    // Payment intent events
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
      
    // Customer events
    case 'customer.created':
      await handleCustomerCreated(event.data.object as Stripe.Customer);
      break;
      
    case 'customer.updated':
      await handleCustomerUpdated(event.data.object as Stripe.Customer);
      break;
      
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

// =====================================================
// SUBSCRIPTION HANDLERS
// =====================================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  
  // Find or create subscription record
  // This depends on your existing logic
  
  // Update trial status if applicable
  if (subscription.status === 'trialing') {
    const trialEndsAt = new Date(subscription.trial_end! * 1000);
    
    await (prisma as any).freeTrial?.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        status: "ACTIVE",
        endsAt: trialEndsAt,
      },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const customerId = subscription.customer as string;
  const status = mapStripeStatus(subscription.status);
  
  // Find subscription by Stripe customer ID
  const existingSub = await (prisma as any).userSubscription?.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  if (!existingSub) {
    console.log('No subscription found for customer:', customerId);
    return;
  }
  
  const periodStart = new Date(subscription.current_period_start * 1000);
  const periodEnd = new Date(subscription.current_period_end * 1000);
  
  await (prisma as any).userSubscription?.update({
    where: { id: existingSub.id },
    data: {
      status: status as SubscriptionStatus,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      isTrial: subscription.status === 'trialing',
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });
  
  // Update trial record if trial ended
  if (subscription.status === 'active' && existingSub.isTrial) {
    await (prisma as any).freeTrial?.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        convertedToTierId: existingSub.tierId,
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const customerId = subscription.customer as string;
  
  await (prisma as any).userSubscription?.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  });
  
  // Update trial record
  await (prisma as any).freeTrial?.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: "CANCELLED" },
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end:', subscription.id);
  
  // This is a heads-up that a trial is ending
  // You might want to send an email reminder
  
  const customerId = subscription.customer as string;
  
  // Find the user and send a reminder
  const userSub = await (prisma as any).userSubscription?.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  if (userSub) {
    await (prisma as any).renewalReminder?.create({
      data: {
        subscriptionId: userSub.id,
        userId: userSub.userId,
        reminderType: 'TRIAL_EXPIRING' as any,
        scheduledFor: new Date(),
        status: 'PENDING' as any,
        channel: 'email',
      },
    });
  }
}

// =====================================================
// INVOICE HANDLERS
// =====================================================

async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  console.log('Invoice created:', invoice.id);
  
  // You might want to create an invoice record here
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  
  const customerId = invoice.customer as string;
  const amountPaid = invoice.amount_paid / 100; // Convert from cents
  
  // Find subscription
  const subscription = await (prisma as any).userSubscription?.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  if (!subscription) return;
  
  // Create or update invoice record
  await (prisma as any).invoice?.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      stripeInvoiceUrl: invoice.hosted_invoice_url,
      stripeInvoicePdf: invoice.invoice_pdf,
      amount: amountPaid,
      status: 'PAID' as any,
      paidAt: new Date(),
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    },
    update: {
      status: 'PAID' as any,
      paidAt: new Date(),
    },
  });
  
  // Create billing history entry
  await (prisma as any).billingHistory?.create({
    data: {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      email: subscription.email,
      stripeInvoiceId: invoice.id,
      amount: amountPaid,
      type: subscription.isTrial ? "TRIAL_CONVERSION" : "RENEWAL",
      status: "SUCCEEDED",
      description: subscription.isTrial 
        ? 'Trial converted to paid subscription' 
        : 'Subscription renewal',
    },
  });
  
  // Mark any pending reminders as handled
  await (prisma as any).renewalReminder?.updateMany({
    where: {
      subscriptionId: subscription.id,
      reminderType: { in: ['TRIAL_EXPIRING', 'SUBSCRIPTION_EXPIRING'] },
      status: 'PENDING' as any,
    },
    data: { status: 'CANCELED' as any },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  const customerId = invoice.customer as string;
  
  const subscription = await (prisma as any).userSubscription?.findFirst({
    where: { stripeCustomerId: customerId },
  });
  
  if (!subscription) return;
  
  // Update subscription status
  await (prisma as any).userSubscription?.update({
    where: { id: subscription.id },
    data: { status: "PAST_DUE" },
  });
  
  // Create billing history entry
  await (prisma as any).billingHistory?.create({
    data: {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      email: subscription.email,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due / 100,
      type: "SUBSCRIPTION",
      status: "FAILED",
      description: 'Payment failed',
    },
  });
  
  // Create payment failed reminder
  await (prisma as any).renewalReminder?.create({
    data: {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      reminderType: 'PAYMENT_FAILED' as any,
      scheduledFor: new Date(),
      status: 'PENDING' as any,
      channel: 'email',
    },
  });
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  console.log('Invoice finalized:', invoice.id);
  
  // Invoice is ready for payment
  // Could send payment reminder here
}

// =====================================================
// CHECKOUT HANDLERS
// =====================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // The subscription was created via checkout
  // Our subscription.created handler should have already processed this
  
  // You might want to:
  // 1. Track the conversion source (utm_*)
  // 2. Send a welcome email
  // 3. Grant access to features
}

// =====================================================
// PAYMENT INTENT HANDLERS
// =====================================================

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update billing history with successful payment
  await (prisma as any).billingHistory?.updateMany({
    where: {
      stripePaymentIntent: paymentIntent.id,
    },
    data: {
      status: "SUCCEEDED",
    },
  });
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update billing history with failed payment
  await (prisma as any).billingHistory?.updateMany({
    where: {
      stripePaymentIntent: paymentIntent.id,
    },
    data: {
      status: "FAILED",
    },
  });
}

// =====================================================
// CUSTOMER HANDLERS
// =====================================================

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Customer created:', customer.id);
  
  // Could sync customer data to your database
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Customer updated:', customer.id);
  
  // Could sync customer data changes
}

export default handleStripeWebhook;
