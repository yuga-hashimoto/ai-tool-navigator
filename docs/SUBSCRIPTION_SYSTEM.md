# Subscription System Documentation

## Overview

This subscription system provides a complete recurring revenue solution with:
- **Subscription Tiers**: Multiple pricing tiers with different features
- **Stripe Integration**: Full Stripe payment processing
- **Free Trials**: Configurable trial periods with automatic conversion
- **Renewal Reminders**: Automated email reminders for trial expiry, renewals, etc.
- **Customer Portal**: Self-service subscription management
- **Analytics Dashboard**: Real-time MRR tracking and metrics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                       │
├──────────────┬──────────────┬──────────────┬──────────────┤
│ PricingCards │ CustomerPortal│AnalyticsDash │              │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
├──────────────────┬──────────────────┬───────────────────────┤
│ /api/subscriptions│ /api/subscriptions │ /api/subscriptions   │
│     /tiers      │    /checkout     │    /webhook          │
└──────┬──────────┴──────┬──────────┴───────────┬───────────┘
       │                 │                       │
       ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 Subscription Manager                          │
│           (Business Logic & Database Operations)            │
└──────┬────────────────────────┬────────────────────────────┘
       │                        │
       ▼                        ▼
┌──────────────────────┐  ┌─────────────────────────────┐
│    Prisma ORM       │  │      Stripe API            │
│   (Database)        │  │  (Payment Processing)     │
└──────────────────────┘  └─────────────────────────────┘
```

## Quick Start

### 1. Database Setup

Add the subscription schema to your Prisma schema:

```prisma
// In your prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // or postgresql/mysql
}

// Include the subscription models
// See prisma/subscription-schema.prisma
```

Then run migrations:
```bash
npx prisma migrate dev --name init_subscriptions
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Scheduler secret for cron jobs
CRON_SECRET=your-cron-secret
```

### 3. Create Subscription Tiers

Run the seed script to create default tiers:

```typescript
import { upsertSubscriptionTier } from '@/lib/subscriptions';

await upsertSubscriptionTier({
  name: 'Free',
  slug: 'free',
  price: 0,
  features: ['Basic features', 'Limited usage'],
});

await upsertSubscriptionTier({
  name: 'Pro',
  slug: 'pro',
  price: 29,
  priceYearly: 290, // 20% discount
  features: ['All basic features', 'Unlimited usage', 'Priority support'],
  isPopular: true,
  trialDays: 14,
});

await upsertSubscriptionTier({
  name: 'Enterprise',
  slug: 'enterprise',
  price: 99,
  priceYearly: 990,
  features: ['All pro features', 'Custom integrations', 'Dedicated support'],
});
```

### 4. Configure Stripe Products

In your Stripe Dashboard:

1. Create products for each tier
2. Create prices (monthly and yearly for each)
3. Copy the price IDs to your tier configuration

### 5. Set Up Webhooks

Configure Stripe webhooks pointing to:
```
https://yourdomain.com/api/subscriptions/webhook
```

Required webhook events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `checkout.session.completed`

## API Reference

### GET /api/subscriptions/tiers

Get all available subscription tiers.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tier_123",
      "name": "Pro",
      "slug": "pro",
      "price": 29,
      "priceYearly": 290,
      "features": ["Feature 1", "Feature 2"],
      "isPopular": true,
      "trialDays": 14
    }
  ]
}
```

### POST /api/subscriptions/checkout

Create a Stripe checkout session.

**Request:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "tierId": "tier_123",
  "billingCycle": "monthly",
  "couponCode": "SAVE20"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/..."
  }
}
```

### POST /api/subscriptions/portal

Create a self-service customer portal session.

**Request:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portalUrl": "https://billing.stripe.com/..."
  }
}
```

### GET /api/subscriptions/user

Get current user's subscription.

**Query Parameters:**
- `userId`: User ID
- `includeHistory`: Include billing history
- `includeInvoices`: Include invoices

### PATCH /api/subscriptions/user/update

Update subscription (upgrade/downgrade/cancel).

**Request:**
```json
{
  "userId": "user_123",
  "action": "upgrade",
  "newTierId": "tier_456"
}
```

Actions:
- `upgrade`: Upgrade to a higher tier
- `downgrade`: Downgrade to a lower tier
- `cancel`: Cancel subscription
- `reactivate`: Reactivate a canceled subscription

### GET /api/subscriptions/analytics

Get subscription analytics.

**Query Parameters:**
- `type`: `current`, `history`, or `byTier`
- `days`: Number of days for history (default: 30)

## Frontend Integration

### Pricing Component

```tsx
import PricingCards from '@/components/subscriptions/PricingCards';

<PricingCards
  tiers={tiers}
  currentTierId={currentTier?.id}
  userId={userId}
  isAuthenticated={isAuthenticated}
/>
```

### Customer Portal

```tsx
import CustomerPortal from '@/components/subscriptions/CustomerPortal';

<CustomerPortal
  userId={userId}
  userEmail={email}
  isAuthenticated={isAuthenticated}
/>
```

### Analytics Dashboard

```tsx
import AnalyticsDashboard from '@/components/subscriptions/AnalyticsDashboard';

<AnalyticsDashboard adminApiKey={adminKey} />
```

## Scheduler Setup

### Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/subscriptions/scheduler?task=reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/subscriptions/scheduler?task=analytics",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Standalone Cron

```bash
# Process reminders every hour
0 * * * * curl https://yourdomain.com/api/subscriptions/scheduler?task=reminders

# Record analytics daily at midnight
0 0 * * * curl https://yourdomain.com/api/subscriptions/scheduler?task=analytics
```

## Conversion Optimization Tips

### 1. A/B Test Pricing

Use different prices and tiers to find optimal conversion:

```typescript
// Track pricing experiments
await trackExperiment({
  userId,
  experiment: 'pricing_v2',
  variant: 'a',
  converted: true,
});
```

### 2. Optimize Trial Conversion

- Send reminder emails at day 3, 7, and 12 of trial
- Show feature usage nudges during trial
- Offer limited-time discounts on last day

### 3. Reduce Churn

- Monitor usage patterns and intervene when dropping
- Offer win-back campaigns after cancellation
- Implement self-serve plan changes to reduce "nuclear option" cancellations

## Security Considerations

1. **Webhook Verification**: Always verify Stripe webhook signatures
2. **API Rate Limiting**: Implement rate limiting on API endpoints
3. **Customer Isolation**: Ensure users can only access their own data
4. **PCI Compliance**: Never store raw credit card numbers

## Troubleshooting

### Webhooks Not Firing

1. Check webhook endpoint is publicly accessible
2. Verify webhook secret matches in both places
3. Check Stripe dashboard for webhook delivery logs

### Checkout Not Working

1. Ensure price IDs are correct in Stripe
2. Check customer email format
3. Verify Stripe API version compatibility

### Analytics Not Recording

1. Check database connection
2. Verify scheduled tasks are running
3. Check for timezone issues in date comparisons

## Support

For issues or questions, check:
- Stripe Dashboard logs
- Application error logs
- Webhook delivery status
