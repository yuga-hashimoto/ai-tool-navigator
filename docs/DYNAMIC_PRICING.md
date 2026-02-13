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

const activeTiers = getActiveTimeSensitiveTiers();
const tier = getTimeSensitivePrice('early_bird_pro');
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

const newPrice = calculateDynamicPrice(config, 0.07);
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
  variant="standard"
  size="md"
  showProgressBar={true}
  autoStart={true}
  onExpire={() => console.log('Timer expired!')}
/>
```

### 4. Urgency Bundle Pricing

Pre-configured bundles with urgency signals:

```typescript
import { URGENCY_BUNDLES, UrgencyBundleCard } from '@/lib/dynamic-pricing';

const bundles = [{
  id: 'pro_power_pack',
  name: 'Pro Power Pack',
  originalTotal: 179.97,
  bundlePrice: 129.99,
  savingsPercent: 28,
  urgencyType: 'limited_time',
  countdownEnd: new Date(Date.now() + 48 * 60 * 60 * 1000)
}];
```

#### Bundle Types

| Type | Use Case | Signal |
|------|----------|--------|
| `bundle_discount` | Percentage off | Value-focused |
| `limited_time` | Countdown timer | Time urgency |
| `low_stock` | Inventory warning | Scarcity |
| `price_increase_coming` | Future price hike | Fear of loss |

### 5. Analytics & Tracking

Track conversion performance:

```typescript
import { calculateUrgencyConversionMetrics, trackConversionFunnel, recordPriceChange } from '@/lib/dynamic-pricing';

const metrics = calculateUrgencyConversionMetrics('early_bird_pro', 'week');
trackConversionFunnel('early_bird_pro', 'view');
trackConversionFunnel('early_bird_pro', 'add_to_cart');
trackConversionFunnel('early_bird_pro', 'purchase', 69.99);
```

## API Endpoints

### GET /api/dynamic-pricing

Retrieve dynamic pricing data:

```bash
GET /api/dynamic-pricing?type=tiers
GET /api/dynamic-pricing?type=bundles
GET /api/dynamic-pricing?type=signals
GET /api/dynamic-pricing?type=metrics&tierId=early_bird_pro&period=week
```

### POST /api/dynamic-pricing

Track events and price changes:

```bash
POST /api/dynamic-pricing
{
  "action": "track_conversion",
  "tierId": "early_bird_pro",
  "event": "purchase",
  "revenue": 69.99
}
```

## Components

### UrgencyCountdown

```tsx
<UrgencyCountdown
  endDate={new Date('2026-02-20')}
  variant="standard"
  size="md"
  showLabels={true}
  onExpire={() => handleExpire()}
/>
```

### PricingTierBadge

```tsx
<PricingTierBadge tier={tierData} size="lg" showDiscount={true} animated={true} />
```

### UrgencyBundleCard

```tsx
<UrgencyBundleCard bundle={bundleData} variant="featured" onAddToCart={handleAdd} />
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
