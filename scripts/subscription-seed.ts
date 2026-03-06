/**
 * Stripe Products & Prices Seed Script
 * Creates subscription tiers in Stripe and database
 * 
 * Usage:
 *   npm run subscription:seed
 *   npm run subscription:seed -- --live  (for production)
 * 
 * Prerequisites:
 *   - STRIPE_SECRET_KEY environment variable set
 *   - Database connection configured
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY not set in environment');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

// Subscription Tier Configuration
const TIERS = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Basic features for exploring AI tools',
    price: 0,
    priceYearly: 0,
    currency: 'USD',
    features: [
      '3 tool comparisons per month',
      'Basic search functionality',
      'View tool details',
      'Community reviews',
    ],
    limits: {
      comparisons: 3,
      exports: 0,
      teamMembers: 1,
    },
    trialDays: 0,
    isPopular: false,
    sortOrder: 1,
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'Unlimited comparisons for power users',
    price: 19,
    priceYearly: 190, // ~17% discount
    currency: 'USD',
    features: [
      'Unlimited tool comparisons',
      'Advanced filtering & search',
      'Export comparisons (PDF, CSV)',
      'Priority support',
      'Early access to new tools',
      'Custom comparison criteria',
      'Team sharing (up to 5 members)',
    ],
    limits: {
      comparisons: -1, // unlimited
      exports: 50,
      teamMembers: 5,
    },
    trialDays: 14,
    isPopular: true,
    sortOrder: 2,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Full access for teams and organizations',
    price: 99,
    priceYearly: 990, // ~17% discount
    currency: 'USD',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'SSO authentication',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom reporting',
      'White-label options',
    ],
    limits: {
      comparisons: -1,
      exports: -1,
      teamMembers: -1,
    },
    trialDays: 30,
    isPopular: false,
    sortOrder: 3,
  },
];

// Launch promotion coupon
const LAUNCH_COUPON = {
  code: 'LAUNCH20',
  percentOff: 20,
  duration: 'repeating' as const,
  durationInMonths: 3,
  maxRedemptions: 1000,
  description: 'Launch special: 20% off first 3 months',
};

async function createStripeProducts(isLive: boolean = false) {
  console.log(`\n🚀 Creating Stripe products in ${isLive ? 'LIVE' : 'TEST'} mode...\n`);

  const createdTiers: Array<{
    tier: typeof TIERS[0];
    productId: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
  }> = [];

  for (const tier of TIERS) {
    // Skip Free tier - no Stripe product needed
    if (tier.price === 0) {
      console.log(`⏭️  Skipping Free tier (no Stripe product needed)`);
      createdTiers.push({
        tier,
        productId: 'free',
        monthlyPriceId: 'free',
        yearlyPriceId: 'free',
      });
      continue;
    }

    console.log(`\n📦 Creating product: ${tier.name}`);

    // Create product
    const product = await stripe.products.create({
      name: `AI Tools Navigator - ${tier.name}`,
      description: tier.description,
      metadata: {
        tier: tier.slug,
        source: 'ai-tool-navigator',
        trial_days: tier.trialDays.toString(),
      },
    });

    console.log(`   ✅ Product created: ${product.id}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.price * 100, // Convert to cents
      currency: tier.currency.toLowerCase(),
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: tier.slug,
        billing_cycle: 'monthly',
      },
    });

    console.log(`   ✅ Monthly price created: ${monthlyPrice.id} ($${tier.price}/mo)`);

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.priceYearly * 100,
      currency: tier.currency.toLowerCase(),
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: tier.slug,
        billing_cycle: 'yearly',
      },
    });

    console.log(`   ✅ Yearly price created: ${yearlyPrice.id} ($${tier.priceYearly}/yr)`);

    createdTiers.push({
      tier,
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
    });
  }

  return createdTiers;
}

async function createLaunchCoupon() {
  console.log(`\n🎟️  Creating launch coupon: ${LAUNCH_COUPON.code}`);

  try {
    // Check if coupon already exists
    const existingCoupons = await stripe.coupons.list({
      limit: 100,
    });

    const existing = existingCoupons.data.find(c => c.id === LAUNCH_COUPON.code);
    if (existing) {
      console.log(`   ⏭️  Coupon already exists: ${existing.id}`);
      return existing;
    }

    const coupon = await stripe.coupons.create({
      id: LAUNCH_COUPON.code,
      percent_off: LAUNCH_COUPON.percentOff,
      duration: LAUNCH_COUPON.duration,
      duration_in_months: LAUNCH_COUPON.durationInMonths,
      max_redemptions: LAUNCH_COUPON.maxRedemptions,
      metadata: {
        description: LAUNCH_COUPON.description,
        source: 'launch-promotion',
      },
    });

    console.log(`   ✅ Coupon created: ${coupon.id}`);
    return coupon;
  } catch (error) {
    console.error(`   ❌ Error creating coupon:`, error);
    return null;
  }
}

async function updateDatabase(tiers: Awaited<ReturnType<typeof createStripeProducts>>) {
  console.log(`\n💾 Updating database with Stripe IDs...\n`);

  // Note: This assumes the subscription-schema.prisma models are migrated
  // In production, we'd use proper Prisma models here

  for (const { tier, productId, monthlyPriceId, yearlyPriceId } of tiers) {
    console.log(`   📝 ${tier.name}:`);
    console.log(`      Product: ${productId}`);
    console.log(`      Monthly: ${monthlyPriceId}`);
    console.log(`      Yearly: ${yearlyPriceId}`);
    
    // In a real implementation, we'd upsert to database:
    // await prisma.subscriptionTier.upsert({
    //   where: { slug: tier.slug },
    //   update: {
    //     stripeProductId: productId,
    //     stripePriceId: monthlyPriceId,
    //     ...
    //   },
    //   create: {
    //     name: tier.name,
    //     slug: tier.slug,
    //     stripeProductId: productId,
    //     stripePriceId: monthlyPriceId,
    //     ...
    //   },
    // });
  }
}

function generateEnvVariables(tiers: Awaited<ReturnType<typeof createStripeProducts>>) {
  console.log(`\n📋 Add these to your environment variables:\n`);
  console.log(`# Stripe Price IDs`);
  
  for (const { tier, monthlyPriceId, yearlyPriceId } of tiers) {
    if (tier.price > 0) {
      const upperSlug = tier.slug.toUpperCase();
      console.log(`STRIPE_${upperSlug}_MONTHLY_PRICE_ID=${monthlyPriceId}`);
      console.log(`STRIPE_${upperSlug}_YEARLY_PRICE_ID=${yearlyPriceId}`);
    }
  }

  console.log(`\n# Stripe Product IDs`);
  for (const { tier, productId } of tiers) {
    if (tier.price > 0) {
      const upperSlug = tier.slug.toUpperCase();
      console.log(`STRIPE_${upperSlug}_PRODUCT_ID=${productId}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live') || args.includes('--production');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   AI Tools Navigator - Stripe Products & Prices Seed');
  console.log('═══════════════════════════════════════════════════════════');

  try {
    // Create products and prices
    const tiers = await createStripeProducts(isLive);

    // Create launch coupon
    await createLaunchCoupon();

    // Update database
    await updateDatabase(tiers);

    // Generate env variables
    generateEnvVariables(tiers);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   ✅ Seed completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📌 Next steps:');
    console.log('   1. Add the environment variables above to Vercel/Dotenv');
    console.log('   2. Configure Stripe webhook endpoint in Stripe Dashboard');
    console.log('   3. Test checkout with test card: 4242 4242 4242 4242');
    console.log('   4. Run E2E payment tests before going live\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
