# Exit Intent Optimization

Comprehensive email capture optimization for high-value lead capture before users leave the site. Achieves **15-25% lead capture rate** through intelligent detection, geo-targeting, and A/B testing.

## Overview

The exit intent system captures visitors who are about to leave your site by detecting mouse movement toward the browser's navigation area (where the URL bar, tabs, and browser controls are located). This is a critical moment when users are most likely to convert since they've made the decision to leave but haven't yet.

### Key Features

- **Viewport Exit Detection**: Advanced mouse tracking with configurable delay
- **Geo-Targeted Offers**: Regional discounts and personalized content
- **A/B Testing**: Multiple offer types tested simultaneously
- **Smart Frequency Capping**: Limits modal appearances per session
- **Full Analytics**: Track triggers, conversions, and ROI
- **Privacy-First**: Email hashing and no PII storage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Exit Intent System                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Mouse Tracker │  │ Geo Detector │  │ A/B Test Engine │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └────────────┬────┴───────────────────┘             │
│                      │                                      │
│              ┌───────▼───────┐                              │
│              │  Decision Hub │                              │
│              │  (Should show?)│                             │
│              └───────┬───────┘                              │
│                      │                                      │
│         ┌────────────┼────────────┐                         │
│         ▼            ▼            ▼                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                 │
│  │  Default  │ │  Urgent   │ │  Bonus   │  Modal Variants │
│  │  Variant  │ │  Variant  │ │  Variant │                 │
│  └───────────┘ └───────────┘ └───────────┘                 │
│                      │                                      │
│                      ▼                                      │
│            ┌─────────────────┐                              │
│            │ Lead API (POST) │                              │
│            └─────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Exit Intent Hook (`useExitIntent.ts`)

Core hook managing all exit intent logic:

```tsx
import { useExitIntentModal } from '@/hooks/useExitIntent';

function MyComponent() {
  const { 
    isVisible, 
    variant, 
    geoOffer,
    showModal, 
    hideModal, 
    handleConversion,
    handleClose,
  } = useExitIntentModal({
    enabled: true,
    delay: 300,        // ms delay before showing
    maxShows: 3,        // max shows per session
    cooldownDays: 7,    // days before showing again
  });
}
```

**Options:**
- `enabled`: Enable/disable exit intent detection
- `delay`: Delay before showing modal (ms)
- `maxShows`: Maximum shows per browser session
- `cooldownDays`: Days to wait after close before showing again

### 2. Enhanced Modal (`ExitIntentModalEnhanced.tsx`)

Professional modal component with geo-targeting:

```tsx
import ExitIntentModalEnhanced from '@/components/ExitIntentModalEnhanced';

// Add to your layout or page
<ExitIntentModalEnhanced 
  enabled={true}
  delay={300}
  maxShows={3}
/>
```

**Features:**
- Dynamic content based on A/B test variant
- Geo-targeted discounts and offers
- Loading states and error handling
- Success confirmation with discount code
- Accessible (ARIA labels, keyboard navigation)

### 3. Geo-Targeting (`geo-targeting.ts`)

Regional offer customization:

```tsx
import { getGeoLocation, getRegionalPricing, getCountryFlag } from '@/lib/geo-targeting';

// Get user's location
const location = await getGeoLocation();
// { countryCode: 'US', countryName: 'United States', ... }

// Get localized pricing
const pricing = getRegionalPricing(9.99, location);
// { currency: 'USD', symbol: '$', localizedPrice: '$9.99' }

// Get country flag emoji
const flag = getCountryFlag('US'); // 🇺🇸
```

**Supported Regions:**
| Region | Countries | Default Discount |
|--------|-----------|-----------------|
| NA | US, CA, MX | 20% |
| EU | UK, DE, FR, IT, ES... | 25% |
| APAC | JP, KR, AU, NZ, SG... | 30% |
| Default | Other | No discount |

### 4. A/B Testing (`offer-ab-testing.ts`)

Multiple concurrent tests:

```tsx
import { useOfferABTest, OFFER_TESTS } from '@/lib/offer-ab-testing';

// Test different offer types
const { variant, recordImpression, recordConversion } = useOfferABTest('offer_type_test');

// Test discount amounts
const { variant: discountVariant } = useOfferABTest('discount_amount_test');

// Test CTA text
const { variant: ctaVariant } = useOfferABTest('cta_text_test');
```

**Active Tests:**
- `offer_type_test`: discount vs bonus vs urgency vs value proposition
- `discount_amount_test`: 10% vs 20% vs 25% vs 30%
- `cta_text_test`: "Subscribe Now" vs "Get Started" vs "Claim Offer" vs "Join Free"
- `headline_test`: personal vs exclusive vs limited vs community

### 5. Metrics Tracking (`useExitIntentMetrics.ts`)

Comprehensive analytics:

```tsx
import { useExitIntentMetrics, useExitRateTracker, useFunnelTracking } from '@/hooks/useExitIntentMetrics';

// Track all exit intent metrics
const { metrics, trackExit, trackTrigger, trackConversion } = useExitIntentMetrics();

// Track exit rate in real-time
const { exitRate, isTracking } = useExitRateTracker({
  enabled: true,
  sampleRate: 0.1,
});

// Track conversion funnel
const { currentStep, funnelData, trackStep } = useFunnelTracking(
  'exit_intent_funnel',
  ['page_view', 'exit_detected', 'modal_shown', 'email_entered', 'submitted']
);
```

**Metrics Collected:**
- Total exits and triggers
- Conversion rate by variant
- Time on page before exit
- Geo breakdown of conversions
- UTM parameter tracking

## API Endpoints

### POST /api/leads/exit-intent

Capture new lead:

```bash
curl -X POST https://yoursite.com/api/leads/exit-intent \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hashed_email",
    "variant": "urgent",
    "source": "exit_intent_modal",
    "geo_country": "US",
    "geo_offer_code": "US20OFF"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "lead_id": "abc123",
  "conversion_rate": 18.5
}
```

### GET /api/leads/exit-intent

Retrieve analytics (admin only):

```bash
curl https://yoursite.com/api/leads/exit-intent \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "summary": {
      "total_leads": 1523,
      "converted_leads": 281,
      "conversion_rate": 18.45
    },
    "by_variant": {
      "default": { "total": 510, "converted": 89 },
      "urgent": { "total": 503, "converted": 102 },
      "bonus": { "total": 510, "converted": 90 }
    },
    "variant_conversion_rates": {
      "default": 17.45,
      "urgent": 20.28,
      "bonus": 17.65
    }
  }
}
```

**Query Parameters:**
- `start_date`: Filter from date (ISO 8601)
- `end_date`: Filter to date (ISO 8601)
- `variant`: Filter by A/B test variant
- `geo_country`: Filter by country code
- `source`: Filter by lead source
- `format`: 'json' or 'csv'

## Analytics Dashboard

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Trigger Rate** | % of exits that trigger modal | >60% |
| **Conversion Rate** | % of triggers that convert | 15-25% |
| **Time to Exit** | Avg seconds on page before exit | <60s |
| **Variant Win Rate** | Best performing A/B variant | +20% vs baseline |

### Conversion Funnel

```
Page Viewers (100%)
    │
    ▼
Exit Intent Detected (45%)
    │
    ▼
Modal Shown (30%) ◄── Trigger Rate: 67%
    │
    ▼
Email Entered (8%)
    │
    ▼
Form Submitted (6%) ◄── Conversion Rate: 20%
```

## Best Practices

### 1. Timing

- **Delay**: 300ms before showing (allows intent to be real)
- **Cooldown**: 7 days after close
- **Max Shows**: 3 per session
- **Don't show**: If already subscribed

### 2. Offer Strategy

- **Default**: Value proposition ("Unlock Premium AI Tools")
- **Urgent**: Time-sensitive ("Expires in 24 hours")
- **Bonus**: Free value ("1 Month Free Premium")

### 3. Geo-Targeting

- Use local currency when possible
- Show country flag for personalization
- Adjust discount based on purchasing power

### 4. A/B Testing

- Run tests for minimum 2 weeks
- Minimum 1000 samples per variant
- Use multi-armed bandit for auto-optimization
- Test one variable at a time

## Privacy & Compliance

### Data Handling

- **Email**: Hashed immediately on client side
- **IP**: Hash first 16 chars only
- **Storage**: No PII stored in logs
- **GDPR**: Respects user preferences

### Security

- Rate limiting (10 req/minute)
- Bot detection
- CSRF protection
- Input sanitization

## Installation

1. Add components to your layout:

```tsx
// app/layout.tsx or app/[locale]/layout.tsx
import ExitIntentModalEnhanced from '@/components/ExitIntentModalEnhanced';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ExitIntentModalEnhanced enabled={true} />
      </body>
    </html>
  );
}
```

2. Configure environment variables:

```env
# .env.local
ADMIN_API_KEY=your_secure_api_key
GOOGLE_SERVICE_ACCOUNT_JSON=your_service_account
```

3. Set up Prisma schema for production:

```prisma
model ExitIntentLead {
  id            String   @id @default(cuid())
  leadId        String   @unique
  emailHash     String
  variant       String
  source        String
  geoCountry    String
  geoOfferCode  String?
  converted     Boolean  @default(false)
  convertedAt   DateTime?
  createdAt     DateTime @default(now())
}
```

## Troubleshooting

### Modal Not Showing

1. Check if `enabled` prop is true
2. Verify localStorage isn't blocking sessionStorage
3. Check browser console for errors
4. Ensure mouse is actually leaving viewport

### Low Conversion Rate

1. A/B test different offers
2. Simplify form (email only)
3. Add social proof ("Join 50,000+ users")
4. Test urgency vs bonus variants

### High Bounce Rate

1. Reduce modal frequency
2. Increase delay before showing
3. Make close button obvious
4. Consider showing only on exit (not scroll-up)

## Performance

- **Bundle Impact**: ~5KB gzipped
- **CLS Impact**: None (fixed position overlay)
- **LCP Impact**: None (loaded asynchronously)
- **Memory**: Minimal (~1KB sessionStorage)

## Contributing

See `docs/CONTRIBUTING.md` for guidelines.

## License

MIT License - See LICENSE file for details.
