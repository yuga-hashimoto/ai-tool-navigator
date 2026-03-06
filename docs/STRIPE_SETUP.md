# Stripe Integration Setup Guide

This guide walks you through setting up Stripe for subscription payments.

## Prerequisites

1. A Stripe account (create one at https://dashboard.stripe.com/register)
2. Node.js installed
3. Access to your project's environment variables

## Step 1: Get Your Stripe API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API Keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root (copy from `.env.example`):

\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your Stripe keys:

\`\`\`env
# Stripe Test Mode Keys
STRIPE_SECRET_KEY="sk_test_your_test_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_test_publishable_key_here"

# Webhook secret (get this in Step 4)
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
\`\`\`

## Step 3: Run the Subscription Seed Script

This creates Stripe products and prices, and seeds your database:

\`\`\`bash
npm run subscription:seed
\`\`\`

This will:
- Create 3 products: Free, Pro ($19/mo), Enterprise ($99/mo)
- Create monthly and yearly pricing
- Create the LAUNCH20 coupon (20% off for 3 months)
- Seed the database with subscription tiers

## Step 4: Set Up Webhooks

Webhooks let Stripe notify your app about payment events.

### For Local Development (Stripe CLI)

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to Stripe:
   \`\`\`bash
   stripe login
   \`\`\`
3. Forward webhooks to your local server:
   \`\`\`bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   \`\`\`
4. Copy the webhook secret shown (starts with `whsec_`)
5. Add it to your `.env.local`:
   \`\`\`env
   STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
   \`\`\`

### For Production

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add to your `.env.local`

## Step 5: Test the Integration

### Test with Stripe Test Cards

Use these card numbers in test mode:
- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0027 6000 3185`

Any future expiry date, any CVC, any postal code.

### Test Checkout Flow

1. Start your dev server: `npm run dev`
2. Navigate to `/pricing` or `/subscription`
3. Select a plan
4. Complete checkout with test card `4242 4242 4242 4242`
5. Verify the subscription appears in Stripe Dashboard

### Verify Webhooks

1. Make a test purchase
2. Check Stripe Dashboard → **Developers** → **Webhooks**
3. Click on your endpoint to see webhook events
4. Verify events are being received (200 status)

## Step 6: Go Live (Production)

### Checklist Before Going Live

- [ ] Stripe account is verified (complete identity verification)
- [ ] Switch to live mode keys in production environment
- [ ] Update `STRIPE_SECRET_KEY` to `sk_live_...`
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `pk_live_...`
- [ ] Create production webhook endpoint
- [ ] Update `STRIPE_WEBHOOK_SECRET` for production
- [ ] Test with a real payment (you can refund afterward)

### Switch to Live Mode

1. In Stripe Dashboard, toggle **Test mode** switch to **OFF**
2. Copy your live API keys
3. Update your production environment variables
4. Run `npm run subscription:seed` in production to create live products/prices
5. Update webhook endpoint to production URL

## Troubleshooting

### "Invalid API key provided"

- Check that your keys are correct (no extra spaces or quotes)
- Make sure you're using test keys in development
- Verify the key starts with `sk_test_` or `sk_live_`

### Webhook signature verification failed

- Check `STRIPE_WEBHOOK_SECRET` is correct
- Make sure you're using the webhook secret, not the API key
- For local dev, ensure Stripe CLI is running and forwarding

### Products not appearing

- Run `npm run subscription:seed`
- Check Stripe Dashboard → Products
- Verify `STRIPE_SECRET_KEY` is set

### Payment fails

- Use test card `4242 4242 4242 4242` for testing
- Check Stripe Dashboard → Logs for error details
- Ensure your Stripe account is activated

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

## Support

For Stripe-specific issues:
- [Stripe Support](https://support.stripe.com)
- [Stripe Discord](https://discord.gg/stripe)

For project-specific issues:
- Open an issue in the repository
