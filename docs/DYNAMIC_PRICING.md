# Dynamic Pricing & Urgency Incentives

This document describes the dynamic pricing system designed to increase checkout conversions by 20-30% through time-sensitive offers, urgency signals, and intelligent price optimization.

## Overview

The dynamic pricing system includes:
- **Time-Sensitive Pricing Tiers**: Early bird, last chance, flash sales, and member-exclusive offers
- **Dynamic Price Adjustment**: Algorithm-based price optimization based on conversion rates
- **Checkout Countdowns**: In-checkout urgency timers to drive completion
- **Urgency Bundles**: Tiered bundle pricing with built-in scarcity signals
- **Analytics & Tracking**: Comprehensive conversion funnel tracking

## Architecture

```
src/lib/dynamic-pricing/
├── dynamicPricing.ts      # Core pricing logic and data models
├── UrgencyCountdown.tsx  # Countdown timer component
├── PricingTierBadge.tsx  # Urgency badge and savings display
├── UrgencyBundleCard.tsx # Bundle pricing card component
├── CheckoutCountdown.tsx # Checkout timer component
└── index.ts              # Library exports
```

## Features

### 1. Time-Sensitive Pricing Tiers

Four types of time-limited offers:

| Tier Type | Discount | Duration | Urgency Level |
|-----------|----------|----------|---------------|
| Early Bird | 20-30% | 14 days | High |
| Last Chance | 15-25% | 2-5 days | Critical |
| Flash Sale | 30-50% | 6-24 hours | Critical |
| Member Exclusive | 15-20% | 30 days | Medium |

#### Usage

```typescript
import { getActiveTimeSensitiveTiers, getTimeSensitivePrice } from '@/lib/dynamic-pricing';

// Get all active tiers
const activeTiers = getActiveTimeSensitiveTiers();

// Get specific tier
const tier = getTimeSensitivePrice('early_bird_pro');
if (tier) {
  console.log(`Current price: $${tier.currentPrice}`);
  console.log(`Discount: ${tier.discountPercent}%`);
  console.log(`Time remaining:`, tier.endDate);
}
```

### 2. Dynamic Price Adjustment

The system automatically adjusts prices based on conversion performance:

```typescript
import { calculateDynamicPrice } from '@/lib/dynamic-pricing';

const config = {
  basePrice: 99.99,
  minPrice: 49.99,
  maxPrice: 149.99,
  adjustmentStrategy: 'demand_based',
  adjustmentSpeed: 0.5,
  demandMultiplier: 1.2,
  urgencyMultiplier: 0.8
};

const conversionRate = 0.07; // 7% conversion
const newPrice = calculateDynamicPrice(config, conversionRate);
```

**Adjustment Strategies:**

- `linear`: Smooth, gradual price changes
- `exponential`: Faster adjustment as data accumulates
- `step`: Tiered pricing based on conversion thresholds
- `demand_based`: Real-time demand-based optimization

### 3. Checkout Countdown

Add urgency to checkout with countdown timers:

```tsx
import CheckoutCountdown from '@/lib/dynamic-pricing/CheckoutCountdown';

<CheckoutCountdown
  variant="standard" // 'standard' | 'compact' | 'inline'
  size="md"          // 'sm' | 'md' | 'lg'
  showProgressBar={true}
  autoStart={true}
  onExpire={() => console.log('Timer expired!')}
  onExtend={() => console.log('User extended timer')}
/>
```

**Configuration:**

```typescript
const config = {
  duration: 15,              // minutes
  priceLock: true,           // lock price during countdown
  discountGuaranteed: true,  // guarantee discount if completed
  urgencyMessage: 'Complete checkout to lock in your price!'
};
```

### 4. Urgency Bundle Pricing

Pre-configured bundles with urgency signals:

```typescript
import { URGENCY_BUNDLES, UrgencyBundleCard } from '@/lib/dynamic-pricing';

// Available bundles
const bundles = [
  {
    id: 'pro_power_pack',
    name: 'Pro Power Pack',
    originalTotal: 179.97,
    bundlePrice: 129.99,
    savingsPercent: 28,
    urgencyType: 'limited_time',
    countdownEnd: new Date(Date.now() + 48 * 60 * 60 * 1000)
  }
];
```

#### Bundle Types

| Type | Use Case | Signal |
|------|----------|--------|
| `bundle_discount` | Percentage off | Value-focused |
| `limited_time` | Countdown timer | Time urgency |
| `low_stock` | Inventory warning | Scarcity |
| `price_increase_coming` | Future price hike | Fear of loss |

### 5. Urgency Signals

Generate real-time urgency signals:

```typescript
import { getActiveUrgencySignals, generateCountdownMessage } from '@/lib/dynamic-pricing';

// Get all active signals
const signals = getActiveUrgencySignals();
signals.forEach(signal => {
  console.log(`[${signal.urgencyLevel}] ${signal.message}`);
  if (signal.actionRequired) {
    console.log(`Action: ${signal.actionRequired}`);
  }
});

// Generate countdown for specific offer
const countdown = generateCountdownMessage(endDate);
```

### 6. Analytics & Tracking

Track conversion performance:

```typescript
import { 
  calculateUrgencyConversionMetrics,
  trackConversionFunnel,
  recordPriceChange 
} from '@/lib/dynamic-pricing';

// Get metrics for a tier
const metrics = calculateUrgencyConversionMetrics('early_bird_pro', 'week');
console.log({
  views: metrics.views,
  conversions: metrics.conversions,
  conversionRate: `${(metrics.conversionRate * 100).toFixed(1)}%`,
  urgencyImpact: `${metrics.urgencyImpact}%`
});

// Track funnel events
trackConversionFunnel('early_bird_pro', 'view');
trackConversionFunnel('early_bird_pro', 'add_to_cart');
trackConversionFunnel('early_bird_pro', 'purchase', 69.99);

// Record price changes
recordPriceChange(
  'early_bird_pro',
  79.99,      // previous price
  69.99,      // new price
  'conversion_optimization', // reason
  0.07,       // conversion rate
  1250        // revenue
);
```

## API Endpoints

### GET /api/dynamic-pricing

Retrieve dynamic pricing data:

```bash
# All data
GET /api/dynamic-pricing

# By type
GET /api/dynamic-pricing?type=tiers
GET /api/dynamic-pricing?type=bundles
GET /api/dynamic-pricing?type=signals
GET /api/dynamic-pricing?type=metrics&tierId=early_bird_pro&period=week

# Specific item
GET /api/dynamic-pricing?type=tiers&id=early_bird_pro
```

### POST /api/dynamic-pricing

Track events and price changes:

```bash
# Track conversion
POST /api/dynamic-pricing
{
  "action": "track_conversion",
  "tierId": "early_bird_pro",
  "event": "purchase",
  "revenue": 69.99
}

# Record price change
POST /api/dynamic-pricing
{
  "action": "record_price_change",
  "tierId": "early_bird_pro",
  "previousPrice": 79.99,
  "newPrice": 69.99,
  "reason": "demand_based",
  "conversionRate": 0.07
}

# Simulate purchase
POST /api/dynamic-pricing
{
  "action": "simulate_purchase",
  "tierId": "early_bird_pro"
}
```

## Components

### UrgencyCountdown

```tsx
import UrgencyCountdown from '@/lib/dynamic-pricing/UrgencyCountdown';

<UrgencyCountdown
  endDate={new Date('2026-02-20')}
  variant="standard"  // 'standard' | 'compact' | 'full'
  size="md"          // 'sm' | 'md' | 'lg'
  showLabels={true}
  onExpire={() => handleExpire()}
/>
```

### PricingTierBadge

```tsx
import PricingTierBadge from '@/lib/dynamic-pricing/PricingTierBadge';

<PricingTierBadge
  tier={tierData}
  size="lg"
  showDiscount={true}
  animated={true}
/>
```

### UrgencyBundleCard

```tsx
import UrgencyBundleCard, { BundleList } from '@/lib/dynamic-pricing/UrgencyBundleCard';

// Single card
<UrgencyBundleCard
  bundle={bundleData}
  variant="featured"
  onAddToCart={(id) => handleAdd(id)}
/>

// Multiple bundles
<BundleList
  bundles={allBundles}
  columns={3}
  featuredOnly={false}
  onAddToCart={handleAdd}
/>
```

## Best Practices

### 1. Urgency Timing

| Stage | Recommended Duration | Example |
|-------|---------------------|---------|
| Early Bird | 14-21 days | Pre-launch offers |
| Flash Sale | 6-24 hours | Limited promotions |
| Last Chance | 2-5 days | Expiring offers |
| Checkout | 10-15 minutes | Cart abandonment |

### 2. Discount Levels

| Offer Type | Discount Range | Conversion Impact |
|------------|----------------|-------------------|
| Entry-level | 10-15% | +5-10% conversions |
| Mid-tier | 20-30% | +15-25% conversions |
| High-value | 30-50% | +25-40% conversions |

### 3. Stock Warnings

| Remaining Stock | Message Style |
|----------------|---------------|
| >30% | "In stock" |
| 15-30% | "Limited stock" |
| 5-15% | "Selling fast!" |
| <5% | "Almost gone!" with pulsing animation |

### 4. A/B Testing Recommendations

Test these variations:
- Countdown vs. no countdown
- Different countdown durations (10 vs 15 vs 20 min)
- Stock warnings vs. time-based urgency
- Bundle vs. single product offers
- Discount levels (20% vs 30% vs 40%)

## Expected Results

Based on industry benchmarks, implementing this system typically yields:

- **20-30% increase** in checkout completion rates
- **15-25% increase** in average order value (bundles)
- **10-20% increase** in conversion from add-to-cart
- **5-10% reduction** in cart abandonment

## Integration Checklist

- [ ] Add dynamic pricing library to frontend
- [ ] Configure time-sensitive tiers
- [ ] Implement checkout countdown component
- [ ] Create urgency bundle cards
- [ ] Set up analytics tracking
- [ ] A/B test urgency signals
- [ ] Monitor conversion metrics
- [ ] Optimize based on data

## Troubleshooting

### Common Issues

1. **Countdown not showing**
   - Verify `endDate` is in the future
   - Check component props are correct

2. **Bundle discounts not calculating**
   - Ensure all items have `originalPrice`
   - Verify `bundlePrice` is less than `originalTotal`

3. **Conversion tracking not working**
   - Check API endpoint is accessible
   - Verify event names match tracking calls

## Future Enhancements

- Machine learning-based price optimization
- Personalized urgency based on user behavior
- Multi-channel urgency notifications
- Geo-based pricing adjustments
- Predictive cart abandonment prevention
