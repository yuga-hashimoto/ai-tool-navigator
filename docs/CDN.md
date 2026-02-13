# CDN Integration Guide

This document describes how to configure and use the CDN integration for static assets.

## Overview

The CDN integration provides:
- Faster asset delivery for global users
- Reduced server load
- Better caching control
- Fallback to original URLs on CDN failure

## Supported Providers

| Provider | Status | Notes |
|----------|--------|-------|
| Cloudflare R2 | ✅ Recommended | S3-compatible, free tier available |
| CloudFront | ✅ Supported | AWS-native CDN |
| Local | ✅ Default | No CDN, serves from server |

## Quick Start

### 1. Enable CDN

Add to your `.env` file:

```env
CDN_ENABLED=true
CDN_PROVIDER=cloudflare-r2
CDN_URL=https://cdn.yourdomain.com
```

### 2. Configure Storage (Cloudflare R2)

```env
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your-bucket-name
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Upload Assets

```bash
# Dry run (see what would be uploaded)
npm run cdn:upload:dry

# Upload all assets
npm run cdn:upload
```

## Cloudflare R2 Setup

1. **Create R2 Bucket**
   - Go to Cloudflare Dashboard → R2
   - Create a new bucket (e.g., `ai-tool-navigator-assets`)

2. **Add Custom Domain**
   - In bucket settings, add a custom domain
   - e.g., `cdn.yourdomain.com`
   - Note: You need a domain registered with Cloudflare

3. **Generate API Token**
   - Go to Profile → API Tokens
   - Create custom token with:
     - `Object Read` permissions
     - `Object Write` permissions
     - Scope: Your bucket

4. **Configure Environment**
   ```
   R2_ACCOUNT_ID=your_account_id (from R2 overview)
   R2_BUCKET_NAME=bucket-name
   R2_ACCESS_KEY_ID=your_api_token_id
   R2_SECRET_ACCESS_KEY=your_api_token_secret
   ```

## CloudFront Setup

1. **Create CloudFront Distribution**
   - Go to AWS Console → CloudFront
   - Create distribution with your S3 bucket as origin
   - Note the distribution domain name

2. **Configure Environment**
   ```env
   CDN_PROVIDER=cloudfront
   CLOUDFRONT_URL=https://d1234567890.cloudfront.net
   ```

## Usage

### In Components

```tsx
import { CDNImage, getCDNUrl } from '@/components/CDNProvider';

// Automatic CDN URL with fallback
<CDNImage src="/images/photo.jpg" alt="Photo" />

// Programmatic URL generation
const url = getCDNUrl('/_next/static/chunks/main.js');
```

### Build & Deploy

```bash
# Build the application
npm run build

# Upload assets to CDN
npm run cdn:upload

# Start production server
npm run start
```

## Monitoring

Import the CDN monitor to track performance:

```tsx
import { trackCDNPerformance, getCDNMetrics } from '@/lib/cdn-monitor';

// Track a CDN request
await trackCDNPerformance('/_next/static/chunks/main.js', 'https://cdn.example.com/_next/static/chunks/main.js');

// Get metrics
const metrics = getCDNMetrics();
console.log(metrics.averageLatency);
console.log(metrics.cacheHitRate);
```

## Cache Configuration

Static assets are cached with appropriate headers:

| Asset Type | Cache Duration |
|------------|----------------|
| Hashed JS/CSS | 1 year (immutable) |
| Static files | 30 days |
| Images | 7 days |
| HTML | 1 day |

## Troubleshooting

### Assets not loading from CDN

1. Check `CDN_ENABLED=true` is set
2. Verify credentials in environment
3. Run `npm run cdn:upload:dry` to see potential uploads

### CORS errors

The CDN headers are automatically configured. For custom domains, ensure:
- Cloudflare: CORS enabled in bucket settings
- CloudFront: CORS policy on the origin

### Fallback not working

The CDN components automatically fall back to original URLs on error. Check browser console for network errors.

## Performance Tips

1. **Use a custom domain** - Better caching and SEO
2. **Enable Brotli compression** - Set in Cloudflare/CloudFront dashboard
3. **Use immutable hashes** - Automatic with Next.js production builds
4. **Monitor metrics** - Use the CDN monitor for insights
