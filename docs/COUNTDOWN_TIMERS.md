# Countdown Timers & Scarcity Elements

This document outlines the implementation of countdown timers and scarcity elements to drive conversions through urgency and FOMO (Fear Of Missing Out).

## Overview

The scarcity system includes:
- **Countdown Timers**: Visual countdowns with expiration logic
- **Stock Indicators**: Real-time stock level displays
- **FOMO Badges**: Time-sensitive urgency badges
- **Dynamic Pricing**: Urgency-based price adjustments
- **Conversion Tracking**: Metrics for optimization

## Components

### Countdown Timer (`CountdownTimer`)

A flexible countdown timer component with multiple variants:

```tsx
import { CountdownTimer } from '@/components/urgency';

<CountdownTimer
  expirationDate={new Date(Date.now() + 86400000)} // 24 hours
  variant="default" // default, compact, minimal, badge
  showLabels={true}
  showProgress={true}
  onExpired={() => console.log('Deal ended!')}
  size="md" // sm, md, lg
  theme="dark"
/>
```

**Variants:**
- `default`: Full countdown with time units (days, hours, minutes, seconds)
- `compact`: Minimal version for smaller spaces
- `minimal`: Just the time for embedding
- `badge`: Small badge-style countdown

**Themes:**
- `dark`: Dark background, light text
- `light`: Light background, dark text

### Stock Indicator (`StockIndicator`)

Displays stock levels with urgency-based styling:

```tsx
import { StockIndicator } from '@/components/urgency';

<StockIndicator
  productId="product-123"
  initialStock={50}
  maxStock={100}
  variant="default" // default, minimal, progress, badge
  showDynamicDiscount={true}
  onLowStock={() => console.log('Low stock!')}
  onSoldOut={() => console.log('Sold out!')}
/>
```

**Variants:**
- `default`: Full stock display with progress bar
- `minimal`: Compact stock indicator
- `progress`: Visual progress bar only
- `badge`: Badge-style stock level

### FOMO Badges (`FomoBadge`)

Time-sensitive urgency badges:

```tsx
import { FomoBadge } from '@/components/urgency';

<FomoBadge
  urgencyLevel="high" // low, medium, high, critical
  variant="default" // default, pulse, glow, outline
  size="md" // sm, md, lg
  showIcon={true}
  customText="Custom text"
/>
```

**Urgency Levels:**
- `low`: Best Value (green)
- `medium`: Limited Time (yellow)
- `high`: Almost Gone! (orange, pulsing)
- `critical`: Selling Fast! (red, fast pulse)

### Dynamic Pricing (`UrgencyPricing`)

Pricing tiers with urgency-based discounts:

```tsx
import { UrgencyPricing } from '@/components/urgency';

<UrgencyPricing
  tiers={[
    { id: 'basic', name: 'Basic', basePrice: 9.99, features: [...] },
    { id: 'pro', name: 'Pro', basePrice: 19.99, features: [...], popular: true },
    { id: 'enterprise', name: 'Enterprise', basePrice: 49.99, features: [...] }
  ]}
  urgencyLevel="high"
  expirationDate={new Date(Date.now() + 3600000)}
  onTierSelect={(id) => console.log('Selected:', id)}
/>
```

## Hooks

### useCountdown

Hook for countdown timer logic:

```tsx
import { useCountdown } from '@/hooks/useCountdown';

const { timeRemaining, isExpired, progress, formatted } = useCountdown(expirationDate, {
  onExpired: () => handleExpiration(),
  intervalMs: 1000
});
```

**Returns:**
- `timeRemaining`: Object with days, hours, minutes, seconds
- `isExpired`: Boolean indicating if countdown is complete
- `progress`: Percentage (0-100) of time elapsed
- `formatted`: Human-readable formatted string

### useProductScarcity

Hook for managing stock scarcity:

```tsx
import { useProductScarcity } from '@/hooks/useScarcity';

const {
  stock,
  metrics,
  stockMessage,
  badgeConfig,
  dynamicDiscount,
  isLowStock,
  isSoldOut,
  decrement,
  refresh
} = useProductScarcity(productId, initialStock, {
  maxStock: 100,
  refreshIntervalMs: 30000,
  onCriticalLevel: () => showLowStockAlert(),
  onSoldOut: () => showSoldOutMessage()
});
```

### useConversionTracking

Hook for tracking urgency-driven conversions:

```tsx
import { useConversionTracking } from '@/hooks/useConversionTracking';

const { trackPageView, trackCountdownView, trackCtaClick, trackPurchase, getMetrics } = useConversionTracking();

// Track events
trackPageView(urgencyLevel);
trackCountdownView('high');
trackCtaClick('critical');
trackPurchase(99.99);

// Get metrics
const metrics = getMetrics();
```

## Utilities (`lib/urgency.ts`)

### calculateUrgencyMetrics

Calculates urgency metrics based on stock and time:

```tsx
import { calculateUrgencyMetrics } from '@/lib/urgency';

const metrics = calculateUrgencyMetrics({
  stockLevel: 25,
  maxStock: 100,
  timeRemainingMs: 3600000, // 1 hour
  totalDurationMs: 86400000 // 24 hours
});
```

### calculateDynamicDiscount

Calculates dynamic discount based on urgency:

```tsx
import { calculateDynamicDiscount } from '@/lib/urgency';

const discount = calculateDynamicDiscount(10, 'high', 25);
// Returns: 15 (base 10 + urgency bonus 5)
```

### getStockUrgencyMessage

Generates urgency message based on stock level:

```tsx
import { getStockUrgencyMessage } from '@/lib/urgency';

getStockUrgencyMessage(5, 100); // "Only 5 left!"
getStockUrgencyMessage(25, 100); // "Selling quickly"
```

## Conversion Rate Tracking

### Key Metrics

| Metric | Description |
|--------|-------------|
| `totalViews` | Total page views |
| `viewsWithUrgency` | Views where urgency was visible |
| `ctrOnUrgency` | Click-through rate on urgency CTAs |
| `conversionRate` | Overall conversion rate |
| `urgencyConversionRate` | Conversion rate with urgency visible |
| `avgTimeToConversion` | Average time to purchase |
| `revenueImpact` | Total revenue from tracked conversions |

### Expected Improvements

Based on industry benchmarks:
- **Countdown timers**: 10-20% conversion increase
- **Stock indicators**: 5-15% conversion increase
- **FOMO badges**: 15-25% conversion increase
- **Combined urgency elements**: 20-30% conversion increase

## Best Practices

### 1. Don't Overuse Urgency
- Use critical urgency sparingly (max 1-2 elements per page)
- Rotate urgency messages to avoid fatigue
- Only show high urgency when genuinely warranted

### 2. Be Honest
- Accurate stock levels build trust
- Real countdowns (not infinite loops)
- Genuine discounts with real savings

### 3. Test and Optimize
- A/B test different urgency messages
- Measure conversion impact
- Adjust urgency thresholds based on data

### 4. Accessibility
- Provide fallback text for screen readers
- Don't rely solely on color for urgency
- Allow users to dismiss urgency elements

## Example Implementation

### Product Page with Full Urgency

```tsx
import { 
  CountdownTimer, 
  StockIndicator, 
  FomoBadge,
  UrgencyCta,
  useConversionTracking 
} from '@/components/urgency';

function ProductPage({ product }) {
  const { trackPageView, trackCtaClick } = useConversionTracking();
  const expirationDate = new Date(Date.now() + 86400000);
  
  return (
    <div className="product-page">
      {/* Urgency header */}
      <div className="flex items-center gap-4 mb-4">
        <FomoBadge urgencyLevel="high" variant="pulse" />
        <SocialProofBadge viewerCount={47} recentPurchases={12} />
      </div>
      
      {/* Countdown */}
      <CountdownTimer
        expirationDate={expirationDate}
        variant="default"
        showProgress
        onExpired={() => updateOffer(product.id)}
      />
      
      {/* Stock indicator */}
      <div className="mt-4">
        <StockIndicator
          productId={product.id}
          initialStock={product.stock}
          showDynamicDiscount
        />
      </div>
      
      {/* CTA with urgency */}
      <div className="mt-6">
        <UrgencyCta
          urgencyLevel="high"
          text="Claim Deal Now"
          discount={15}
          onClick={() => {
            trackCtaClick('high');
            addToCart(product.id);
          }}
        />
      </div>
    </div>
  );
}
```

## File Structure

```
src/
├── components/
│   └── urgency/
│       ├── CountdownTimer.tsx    # Countdown timer component
│       ├── StockIndicator.tsx    # Stock scarcity display
│       ├── FomoBadge.tsx         # FOMO and urgency badges
│       ├── UrgencyPricing.tsx    # Dynamic pricing tiers
│       ├── UrgencyDemo.tsx       # Demo component
│       └── index.ts              # Component exports
├── hooks/
│   ├── useCountdown.ts           # Countdown timer hook
│   ├── useScarcity.ts            # Scarcity management hook
│   └── useConversionTracking.ts  # Conversion tracking hook
└── lib/
    └── urgency.ts                # Utility functions
```

## Performance Considerations

1. **Countdown intervals**: Use 1-second intervals, not more frequent
2. **Stock refreshes**: Cache stock data, refresh every 30-60 seconds
3. **Lazy load**: Only load urgency components when needed
4. **Debounced tracking**: Batch conversion events to reduce API calls

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+ required
- Tailwind CSS 4.x required for styling

## Related Documentation

- [Subscription System](SUBSCRIPTION_SYSTEM.md)
- [Bundle Deals](BUNDLE_DEALS.md)
- [Tier Upselling](TIER_Upselling.md)
