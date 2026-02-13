# Web Vitals Monitoring Documentation

This document describes the Core Web Vitals monitoring implementation for the AI Tool Navigator project.

## Overview

The system tracks the following Core Web Vitals metrics:

| Metric | Full Name | Description | Good Threshold |
|--------|-----------|-------------|----------------|
| FCP | First Contentful Paint | Time until first content is visible | ≤ 1.8s |
| LCP | Largest Contentful Paint | Time until largest content is visible | ≤ 2.5s |
| CLS | Cumulative Layout Shift | Visual stability (no unexpected shifts) | ≤ 0.1 |
| FID | First Input Delay | Interactivity delay | ≤ 100ms |
| TBT | Total Blocking Time | Total time main thread is blocked | ≤ 200ms |
| TTFB | Time to First Byte | Server response time | ≤ 800ms |

## Architecture

### Components

1. **`src/hooks/useWebVitals.ts`** - React hook for collecting Web Vitals metrics
   - Uses the `web-vitals` library for accurate browser-based measurements
   - Automatically reports metrics to GA4
   - Checks against alert thresholds
   - Sends data to the analytics API endpoint

2. **`src/components/WebVitalsProvider.tsx`** - React provider component
   - Wraps the application to enable automatic tracking
   - Integrates with existing GA4 setup
   - Sends custom events for detailed analytics

3. **`src/app/api/analytics/web-vitals/route.ts`** - API endpoint
   - Receives and stores metrics from client
   - Calculates statistics (avg, p50, p75, p90, p95)
   - Tracks performance alerts
   - Returns aggregated data for the dashboard

4. **`src/app/[locale]/admin/performance/`** - Admin dashboard
   - Real-time performance overview
   - Per-metric statistics
   - Page-type performance breakdown
   - Alert threshold configuration display

## Integration Points

### GA4 Integration

Web Vitals data is automatically sent to GA4 as custom events:

```javascript
gtag('event', 'LCP', {
  event_category: 'Web Vitals',
  event_label: '/',
  value: 2450,
  metric_rating: 'good',
  metric_delta: 50
});
```

### Page Types Tracked

- **Homepage** (`/`)
- **Tool Detail Pages** (`/tools/[slug]`)
- **Blog Posts** (`/blog/[slug]`)
- **Category Pages** (`/category/[slug]`)

## Alert Thresholds

### Default Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| LCP | > 2.5s | > 4.0s |
| FCP | > 1.8s | > 3.0s |
| CLS | > 0.1 | > 0.25 |
| FID | > 100ms | > 300ms |
| TTI | > 3.8s | > 7.3s |
| TBT | > 300ms | > 600ms |
| TTFB | > 800ms | > 1.8s |

### Alert Behavior

- **Warning**: Metric exceeds warning threshold (logged to console)
- **Critical**: Metric exceeds critical threshold (logged with higher priority)
- Alerts are stored in the metrics API for dashboard display

## API Endpoints

### POST `/api/analytics/web-vitals`

Submit a new Web Vitals metric:

```json
{
  "id": "v1-1234567890",
  "name": "LCP",
  "value": 2450,
  "rating": "good",
  "delta": 50,
  "page": "/tools/chatgpt",
  "timestamp": 1699999999999
}
```

### GET `/api/analytics/web-vitals`

Query metrics with optional filters:

```
/api/analytics/web-vitals?page=/tools/chatgpt&metric=LCP&limit=100
```

Response:

```json
{
  "metrics": [...],
  "total": 500,
  "alerts": [...],
  "stats": {
    "LCP": {
      "count": 100,
      "avg": 2450,
      "p50": 2400,
      "p75": 2600,
      "p90": 3000,
      "p95": 3500,
      "goodRate": 75.5,
      "needsImprovementRate": 18.5,
      "poorRate": 6.0
    }
  },
  "thresholds": [...]
}
```

## Admin Dashboard

Access the performance dashboard at: `/[locale]/admin/performance`

### Features

1. **Metrics Overview** - Real-time p50 values for all Core Web Vitals
2. **Alert Summary** - Recent performance alerts with severity levels
3. **Detailed Statistics** - Expandable metric cards with percentiles
4. **Page-Type Performance** - Performance breakdown by page category
5. **Threshold Monitoring** - Current p75 vs. configured thresholds

## Customization

### Modifying Thresholds

Edit `src/hooks/useWebVitals.ts`:

```typescript
export const DEFAULT_ALERT_THRESHOLDS: AlertThreshold[] = [
  { metric: "LCP", warning: 2500, critical: 4000 },
  // Add or modify thresholds
];
```

### Adding New Metrics

To track additional metrics:

1. Add the metric name to `METRIC_CONFIG` in the dashboard
2. Subscribe to the metric in `useWebVitals.ts`
3. Update the threshold configuration

## Development Notes

### Testing Locally

1. Run `npm run dev` to start the development server
2. Open browser console
3. Navigate around the site
4. Check console for `[Web Vitals]` log entries

### Production Deployment

Metrics are sent using `keepalive: true` to ensure delivery even during page unloads. The API stores metrics in-memory for demo purposes. For production:

- Replace in-memory storage with Redis or a database
- Set up data retention policies
- Configure rate limiting
- Add authentication for the admin dashboard

## Related Files

- `src/hooks/useWebVitals.ts` - Core tracking logic
- `src/components/WebVitalsProvider.tsx` - React provider
- `src/app/api/analytics/web-vitals/route.ts` - API endpoint
- `src/app/[locale]/admin/performance/` - Dashboard
- `src/lib/analytics.ts` - GA4 integration utilities
