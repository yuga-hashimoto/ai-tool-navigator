# Affiliate Partner Documentation

This document outlines the affiliate tracking system, how to use it, and best practices for maximizing your earnings.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Link Attribution](#link-attribution)
4. [Tracking Parameters](#tracking-parameters)
5. [Conversion Tracking](#conversion-tracking)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Best Practices](#best-practices)
8. [Compliance](#compliance)

## Overview

Our affiliate program allows partners to earn commissions by referring users to our recommended tools and services. We use a sophisticated tracking system that:

- **Tracks clicks** from your links to our site
- **Attributes conversions** using a 90-day cookie window
- **Supports multiple attribution models** (first-touch, last-touch, etc.)
- **Provides real-time analytics** for performance monitoring

## Getting Started

### Joining the Program

1. Apply through our [affiliate program page](/affiliate/signup)
2. Receive your unique affiliate ID upon approval
3. Generate tracked links using our tools or API

### Your Affiliate ID

Your affiliate ID is a unique identifier used in all your tracked links. Format: `affiliate_[username]` or custom ID assigned to you.

Example: `affiliate_johnsmith`, `partner_company123`

## Link Attribution

### Basic Tracked Link

```http
https://aitoolnavigator.com/tools/cursor?ref=YOUR_AFFILIATE_ID
```

### Link with UTM Parameters

```http
https://aitoolnavigator.com/tools/cursor?ref=YOUR_AFFILIATE_ID&utm_source=affiliate&utm_medium=social&utm_campaign=spring_promo
```

### HTML Link Example

```html
<a href="https://aitoolnavigator.com/tools/cursor?ref=YOUR_AFFILIATE_ID" 
   target="_blank" 
   rel="noopener noreferrer">
  Try Cursor - AI Code Editor
</a>
```

### JavaScript Tracking (Optional)

For programmatic link generation:

```javascript
import { buildAffiliateUrl } from '@/lib/affiliate-tracking';

const trackedUrl = buildAffiliateUrl('https://cursor.sh', {
  affiliateId: 'YOUR_AFFILIATE_ID',
  source: 'affiliate',
  medium: 'blog_post',
  campaign: 'spring_2026',
  content: 'hero_cta',
  term: 'ai code editor'
});
```

## Tracking Parameters

### UTM Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `utm_source` | Traffic source | `utm_source=google`, `utm_source=twitter` |
| `utm_medium` | Marketing medium | `utm_medium=cpc`, `utm_medium=email` |
| `utm_campaign` | Campaign name | `utm_campaign=spring_promo_2026` |
| `utm_content` | Link content variant | `utm_content=hero_button` |
| `utm_term` | Search keyword | `utm_term=ai+code+editor` |
| `ref` | **Required** - Your affiliate ID | `ref=affiliate_johnsmith` |

### Custom Parameters

You can also use our custom parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `affiliate` | Alternative to `ref` | `affiliate=johnsmith` |

## Conversion Tracking

### Conversion Types

We track the following conversion types:

| Type | Description | Commission |
|------|-------------|------------|
| `signup` | New user registration | 10% of referred revenue |
| `trial` | Free trial started | 15% of referred revenue |
| `upgrade` | Upgrade to paid plan | 20% of referred revenue |
| `purchase` | Direct purchase | 25% of referred revenue |

### Attribution Window

- **Cookie Duration**: 90 days from first click
- **Attribution Model**: Last-touch by default (configurable)
- **View-Through Attribution**: 24 hours for display campaigns

### Programmatic Conversion Tracking

For server-side tracking:

```javascript
// POST /api/affiliate/conversion
const response = await fetch('/api/affiliate/conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    toolSlug: 'cursor',
    conversionType: 'signup',
    value: 29.99,
    currency: 'USD',
    attributionModel: 'last_touch'
  })
});
```

## Analytics Dashboard

### Available Metrics

| Metric | Description |
|--------|-------------|
| Clicks | Total number of tracked link clicks |
| Conversions | Total number of successful conversions |
| Revenue | Total revenue generated through your links |
| Conversion Rate | Conversions / Clicks × 100 |
| AOV | Average Order Value |
| EPC | Earnings Per Click |

### API Endpoints

#### Get Overview Analytics

```http
GET /api/affiliate/analytics
```

Response:
```json
{
  "totalClicks": 1250,
  "totalConversions": 87,
  "totalRevenue": 4567.89,
  "uniqueAffiliates": 45,
  "conversionRate": 6.96,
  "averageOrderValue": 52.5
}
```

#### Get Affiliate-Specific Metrics

```http
GET /api/affiliate/analytics?affiliateId=YOUR_ID&groupBy=affiliate
```

Response:
```json
{
  "affiliateId": "affiliate_johnsmith",
  "clicks": 342,
  "conversions": 23,
  "revenue": 1234.56,
  "conversionRate": 6.73,
  "averageOrderValue": 53.68,
  "topCampaigns": [...],
  "topTools": [...],
  "dailyBreakdown": [...]
}
```

#### Get Tool-Level Metrics

```http
GET /api/affiliate/analytics?groupBy=tool
```

#### Get Campaign-Level Metrics

```http
GET /api/affiliate/analytics?groupBy=campaign
```

### Date Range Filtering

Filter analytics by date range:

```http
GET /api/affiliate/analytics?startDate=2026-01-01&endDate=2026-01-31
```

## Best Practices

### 1. Use Descriptive Link Text

❌ **Avoid**: "Click here"
✅ **Better**: "Try Cursor AI Code Editor"

### 2. Add Context to Your Links

Always explain why you're recommending the tool:

```
"I use Cursor every day for coding. Here's my referral link if you want to try it:"
```

### 3. Use Multiple Tracking Parameters

Track which campaigns perform best:

```http
utm_source=newsletter&utm_medium=email&utm_campaign=weekly_pick
```

### 4. Test Different Placements

Try different CTA positions and measure conversion rates.

### 5. Disclose Your Partnership

Be transparent about your affiliate relationship. Use our disclaimer component:

```tsx
import { AffiliateDisclaimer } from '@/components/AffiliateDisclaimer';

<AffiliateDisclosure />
```

## Compliance

### Disclosure Requirements

- **FTC (US)**: Clearly disclose your affiliate relationship
- **GDPR (EU)**: Users can opt out of tracking
- **CCPA (California)**: California residents can request data deletion

### Privacy Compliance

Our tracking system is designed to comply with:

- **GDPR**: Minimizes personal data, provides opt-out
- **CCPA**: Respects "Do Not Sell" requests
- **PECR (UK)**: Cookie consent compliant

### Opt-Out Options

Users can opt out of tracking by:

1. Setting browser to block third-party cookies
2. Using privacy extensions (uBlock Origin, Privacy Badger)
3. Opting out via our [privacy settings](/privacy#tracking)

### Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Click Data | 2 years |
| Conversion Data | 7 years (financial records) |
| Analytics Aggregates | Indefinite |

## Support

- **Email**: affiliates@aitoolnavigator.com
- **Documentation**: /docs/affiliate
- **Dashboard**: /affiliate/dashboard

---

Last Updated: 2026-02-13
Version: 1.0.0
