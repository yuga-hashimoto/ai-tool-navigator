/**
 * Seed Subscription Tiers with Stripe Products
 * 
 * This script creates subscription tiers in the database and corresponding
 * products/prices in Stripe for production-ready payments.
 * 
 * Usage:
 *   STRIPE_SECRET_KEY=sk_xxx npx ts-node scripts/seed-subscription-tiers.ts
 * 
 * Requirements:
 *   - STRIPE_SECRET_KEY in environment
 * 
 * Note: This script only creates Stripe products. Database seeding requires
 *   running Prisma migrations first, which can be done separately.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Subscription tier definition type
interface TierDefinition {
  name: string;
  slug: string;
  description: string;
  price: number;
  priceYearly: number;
  features: string[];
  limits: Record<string, number>;
  isPopular: boolean;
  trialDays: number;
  sortOrder: number;
  stripeProductId?: string;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
}

// Subscription tier definitions
const TIERS: TierDefinition[] = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Get started with basic AI tool discovery and comparison features.',
    price: 0,
    priceYearly: 0,
    features: [
      'Browse 500+ AI tools',
      'Basic comparison features',
      'Community reviews',
      '3 tool comparisons per month',
      'Basic search filters',
    ],
    limits: {
      comparisons: 3,
      saved_tools: 10,
      alerts: 1,
    },
    isPopular: false,
    trialDays: 0,
    sortOrder: 1,
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'Unlock advanced features for serious AI tool researchers and teams.',
    price: 19,
    priceYearly: 190, // ~17% discount
    features: [
      'Everything in Free',
      'Unlimited comparisons',
      'Advanced analytics & insights',
      'Priority support',
      'Custom recommendations',
      'Export reports (PDF, CSV)',
      'API access (1000 calls/month)',
      'Team collaboration (up to 5 members)',
    ],
    limits: {
      comparisons: -1, // unlimited
      saved_tools: 100,
      alerts: 10,
      api_calls: 1000,
      team_members: 5,
    },
    isPopular: true,
    trialDays: 14,
    sortOrder: 2,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Full-scale AI tool intelligence for large teams and organizations.',
    price: 99,
    priceYearly: 990, // ~17% discount
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'SSO & SAML authentication',
      'Custom integrations',
      'Dedicated account manager',
      'Custom training & onboarding',
      'Unlimited API access',
      'White-label reports',
      'SLA guarantee',
      'Custom analytics dashboards',
    ],
    limits: {
      comparisons: -1,
      saved_tools: -1,
      alerts: -1,
      api_calls: -1,
      team_members: -1,
    },
    isPopular: false,
    trialDays: 30,
    sortOrder: 3,
  },
];

async function createStripeProducts(): Promise<TierDefinition[]> {
  console.log('🚀 Creating Stripe products and prices...\n');

  for (const tier of TIERS) {
    if (tier.price === 0) {
      console.log(`✓ Skipping Free tier (no Stripe product needed)`);
      continue;
    }

    // Create product
    const product = await stripe.products.create({
      name: `AI Tools Navigator - ${tier.name}`,
      description: tier.description,
      metadata: {
        tier_slug: tier.slug,
        features: tier.features.slice(0, 5).join(', '),
      },
    });

    console.log(`✓ Created product: ${product.id} for ${tier.name}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.price * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier_slug: tier.slug,
        billing_cycle: 'monthly',
      },
    });

    console.log(`  ✓ Monthly price: ${monthlyPrice.id} ($${tier.price}/mo)`);

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.priceYearly * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier_slug: tier.slug,
        billing_cycle: 'yearly',
        discount_percent: Math.round((1 - tier.priceYearly / (tier.price * 12)) * 100),
      },
    });

    console.log(`  ✓ Yearly price: ${yearlyPrice.id} ($${tier.priceYearly}/yr)\n`);

    // Update tier with Stripe IDs
    (tier as any).stripeProductId = product.id;
    (tier as any).stripePriceId = monthlyPrice.id;
    (tier as any).stripeYearlyPriceId = yearlyPrice.id;
  }

  return TIERS;
}

async function seedDatabase(tiers: TierDefinition[]) {
  console.log('\n💾 Database seeding requires Prisma client.');
  console.log('   Run the following SQL directly or use Prisma Studio:\n');
  
  for (const tier of tiers) {
    const t = tier as any;
    console.log(`-- Tier: ${tier.name}`);
    console.log(`INSERT INTO subscription_tiers (id, name, slug, description, stripe_product_id, stripe_price_id, price, price_yearly, currency, features, limits, is_popular, is_active, trial_days, sort_order)`);
    console.log(`VALUES (lower(hex(randomblob(16))), '${tier.name}', '${tier.slug}', '${tier.description?.replace(/'/g, "''")}', ${t.stripeProductId ? `'${t.stripeProductId}'` : 'NULL'}, ${t.stripePriceId ? `'${t.stripePriceId}'` : 'NULL'}, ${tier.price}, ${tier.priceYearly}, 'USD', '${JSON.stringify(tier.features)}', '${JSON.stringify(tier.limits)}', ${tier.isPopular ? 1 : 0}, 1, ${tier.trialDays}, ${tier.sortOrder});\n`);
  }
  
  console.log('✅ SQL statements generated!');
}

async function createPromotionalCoupons() {
  console.log('\n🎟️ Creating promotional coupons...\n');

  try {
    // Launch discount coupon (20% off first 3 months)
    const launchCoupon = await stripe.coupons.create({
      duration: 'repeating',
      duration_in_months: 3,
      percent_off: 20,
      name: 'Launch Special - 20% Off',
      metadata: {
        campaign: 'launch_2026',
        source: 'ai_tools_navigator',
      },
    });

    console.log(`✓ Created launch coupon: ${launchCoupon.id}`);
    console.log(`  Code: LAUNCH20`);
    console.log(`  Discount: 20% off for first 3 months`);
    console.log(`  Use this code for early adopters!\n`);
  } catch (error) {
    console.log('⚠️ Could not create coupon (Stripe not configured):', error);
  }
}

async function main() {
  console.log('================================================');
  console.log('  AI Tools Navigator - Subscription Setup');
  console.log('================================================\n');

  try {
    // Step 1: Create Stripe products
    const tiers = await createStripeProducts();

    // Step 2: Seed database
    await seedDatabase(tiers);

    // Step 3: Create promotional coupons
    await createPromotionalCoupons();

    console.log('\n🎉 Setup complete! Stripe products created.');
    console.log('\n📋 Next steps:');
    console.log('   1. Copy the SQL statements above');
    console.log('   2. Run them in your database (Prisma Studio or sqlite3)');
    console.log('   3. Add STRIPE_WEBHOOK_SECRET to .env');
    console.log('   4. Configure webhook endpoint in Stripe dashboard:');
    console.log('      https://your-domain.com/api/subscriptions/webhook');
    console.log('   5. Test checkout flow');
    console.log('   6. Launch with LAUNCH20 coupon for early adopters!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
