# Security Policy - Rate Limiting and Anti-Bot Protection

## Overview

This document outlines the security measures implemented to protect the application from rate limiting abuse, bot attacks, and suspicious activity.

## Table of Contents

1. [Rate Limiting](#rate-limiting)
2. [Bot Detection](#bot-detection)
3. [IP Reputation](#ip-reputation)
4. [CAPTCHA System](#captcha-system)
5. [Honeypot Protection](#honeypot-protection)
6. [Anomaly Detection](#anomaly-detection)
7. [Audit Logging](#audit-logging)
8. [Configuration](#configuration)
9. [Monitoring](#monitoring)

---

## Rate Limiting

### Implementation

The rate limiting system uses a sliding window algorithm implemented with Redis (with in-memory fallback for development).

### Limits

| Endpoint Type | Requests | Time Window |
|-------------|----------|-------------|
| Global (per IP) | 30 | 1 minute |
| Per User | 100 | 1 minute |
| API Submit | 5 | 1 minute |
| API Subscribe | 3 | 5 minutes |
| Auth Login | 5 | 5 minutes |

### Headers

The following headers are included in API responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Seconds until window resets
- `X-RateLimit-Limited`: Set to "true" when limited

### Response Codes

- **200**: Request allowed
- **429**: Rate limit exceeded (with `Retry-After` header)
- **403**: IP blocked or bot detected

---

## Bot Detection

### Detection Methods

1. **User-Agent Analysis**
   - Checks against known bot patterns
   - Validates presence and format
   - Flags missing or empty agents

2. **Header Validation**
   - Verifies required headers (User-Agent, Accept, Accept-Language)
   - Detects suspicious/malicious headers
   - Checks for header anomalies

3. **Behavioral Analysis**
   - Detects automated request patterns
   - Identifies suspicious paths (admin, wp-admin, etc.)
   - Analyzes timing patterns

4. **Honeypot Fields**
   - Hidden form fields that only bots would fill
   - Time-based validation (too fast = bot)
   - Token validation

### Scoring System

- **100**: Definitely human
- **80-99**: Normal traffic
- **50-79**: Flagged for review
- **30-49**: Requires CAPTCHA
- **0-29**: Blocked as bot

---

## IP Reputation

### Scoring

IP reputation scores range from -100 to 100:

- **100**: Trusted IP
- **50-99**: Good reputation
- **0-49**: Neutral
- **-1 to -49**: Suspicious
- **-100**: Blocked

### Reputation Factors

- **Positive**: Successful requests improve score
- **Negative**: Failed attempts, bot detection, rate limit violations decrease score

### Blocked IP Categories

- Known VPN/Proxy ranges
- Datacenter IPs (optional blocking)
- Manually blocked IPs
- IPs with reputation below threshold

---

## CAPTCHA System

### Types

1. **Simple CAPTCHA**: 6-character alphanumeric code
2. **Math CAPTCHA**: Simple arithmetic problems
3. **Turnstile**: Cloudflare integration (optional)

### Flow

1. Server generates challenge → returns ID and question
2. User submits answer with ID
3. Server validates (max 3 attempts)
4. On success: Clear CAPTCHA requirement
5. On failure: Record failed attempt

### Configuration

- **Expiration**: 5 minutes
- **Max Attempts**: 3 per challenge
- **Session TTL**: 1 hour for failed attempts

---

## Honeypot Protection

### Implementation

Hidden form fields that legitimate users won't see or fill:

```jsx
<CombinedHoneypot 
  websiteFieldName="website_url"
  companyFieldName="company_name"
  timeFieldName="form_timestamp"
  tokenFieldName="homepage"
/>
```

### Detection

- **Website Field**: Bots often fill "website" fields
- **Company Field**: Legitimate users rarely fill company
- **Time Field**: Must take >2 seconds to fill form
- **Token Field**: Bots may change default values

### Response

When honeypot triggers, the request is silently accepted (to avoid alerting bots) but marked as spam.

---

## Anomaly Detection

### Detection Types

1. **High Frequency**: >50 requests/minute
2. **Unusual Paths**: Access to rare sensitive paths
3. **Error Spikes**: >50% error rate
4. **Temporal Anomalies**: Suspiciously regular intervals
5. **Unusual Methods**: Non-standard HTTP methods

### Response

Anomalies are scored (0-100) and may trigger:
- CAPTCHA requirement
- Temporary block
- Reputation reduction

---

## Audit Logging

### Events Logged

- Rate limit exceeded/allowed
- Bot detected/blocked
- CAPTCHA required
- IP blocked/unblocked
- Form submissions (spam detection)
- Anomalies detected

### Retention

- Default: 30 days
- Configurable via `CLEANUP_INTERVALS.AUDIT_LOG_RETENTION`

### Query API

`GET /api/admin/security?type=stats&period=24`

Returns:
- Total requests
- Blocked requests
- Bot detections
- Rate limit violations
- Top IPs
- Top paths

---

## Configuration

### Environment Variables

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Cloudflare Turnstile (optional)
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key

# Admin API
ADMIN_API_KEY=your_secure_admin_key
```

### Configuration File

Edit `src/lib/security/rate-limit-config.ts`:

```typescript
export const RATE_LIMITS = {
  IP: {
    requests: 30,        // Adjust as needed
    windowSeconds: 60,
  },
  // ... other limits
};
```

---

## Monitoring

### Security Headers

All responses include:
- `X-Bot-Score`: Bot detection score
- `X-IP-Reputation`: IP reputation score
- `X-RateLimit-*`: Rate limit info

### Dashboard

Access admin dashboard at `/api/admin/security` with `x-api-key` header.

### Logs

Check server logs for:
- `[SECURITY]`: Security events
- `[RATE_LIMIT]`: Rate limit events
- `[BOT]`: Bot detection events

---

## Response Codes Summary

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process request |
| 400 | Bad Request | Return error |
| 401 | Unauthorized | Check API key |
| 403 | Forbidden | Block request |
| 429 | Too Many Requests | Require CAPTCHA or wait |

---

## Troubleshooting

### Legitimate Requests Blocked

1. Check IP reputation in dashboard
2. Unblock IP via admin API
3. Adjust rate limits if too strict

### CAPTCHA Always Required

1. Check IP reputation score
2. Clear CAPTCHA requirement
3. Review bot detection flags

### High False Positives

1. Review bot detection rules
2. Adjust scoring thresholds
3. Add legitimate user agents to whitelist

---

## Support

For security issues or questions, please review the code in `src/lib/security/`.

Last Updated: 2026-02-13
