# Abandoned Affiliate Link Recovery System

This document describes the abandoned affiliate link recovery system designed to recapture lost affiliate revenue through exit intent detection, email capture, and recovery campaigns.

## Overview

The abandoned affiliate link recovery system targets the 25-35% of visitors who click affiliate links but leave without converting. By capturing these users and re-engaging them through email sequences, we can recover significant lost revenue.

### Key Features

1. **Exit Intent Detection** - Detects when users are about to leave the page
2. **Tab/Window Close Tracking** - Captures users closing browser tabs
3. **Timeout Abandonment** - Identifies users who stop engaging
4. **Email Capture** - Collects email addresses for recovery campaigns
5. **One-Click Recovery Links** - Generates direct recovery URLs
6. **Cart Abandonment** - Special tracking for checkout abandoners
7. **Channel Analytics** - Tracks recovery rates by channel

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Abandonment Tracking Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐│
│  │  User on    │───▶│  Exit Intent    │───▶│  Show Modal     ││
│  │  Tool Page  │    │  Detection      │    │  with Email      ││
│  └─────────────┘    └─────────────────┘    └────────┬────────┘│
│                                                    │           │
│                                                    ▼           │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐│
│  │  Recovery   │◀───│  Email Capture  │◀───│  User Enters    ││
│  │  Sequence   │    │  & Storage      │    │  Email          ││
│  └──────┬──────┘    └─────────────────┘    └─────────────────┘│
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Recovery Sequence                       │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐               │   │
│  │  │ Email 1  │──▶│ Email 2  │──▶│ Email 3  │──▶...        │   │
│  │  │  1 Hour │   │ 24 Hours │   │ 72 Hours │               │   │
│  │  └─────────┘   └─────────┘   └─────────┘               │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐│
│  │  Recovery   │◀───│  User Clicks    │◀───│  Email Delivered ││
│  │  Complete   │    │  Recovery Link  │    │  & Opened        ││
│  └─────────────┘    └─────────────────┘    └─────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tracking Implementation

### Exit Intent Detection

The system detects exit intent through mouse movement tracking:

```typescript
// When mouse cursor moves above the page threshold
if (e.clientY <= exitIntentThreshold) {
  recordPageExit('exit_intent');
}
```

**Key behaviors:**
- Only triggers once per session
- Doesn't trigger if modal is already open
- Captures engagement signals (time on page, scroll depth)

### Tab Close Detection

```typescript
window.addEventListener('beforeunload', (e) => {
  if (!isModalOpen && timeOnPage > 10) {
    recordPageExit('tab_close');
  }
});
```

### Timeout Abandonment

Automatically triggers after user inactivity:

```typescript
const timeoutSeconds = 60;
const interval = setInterval(() => {
  timeSpent += 1;
  if (timeSpent >= timeoutSeconds) {
    recordPageExit('timeout');
    clearInterval(interval);
  }
}, 1000);
```

## Database Schema

### abandoned_links Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique identifier |
| session_id | TEXT | Session identifier |
| visitor_id | TEXT | Anonymized visitor ID |
| visitor_email | TEXT | Captured email address |
| affiliate_id | TEXT | Original affiliate ID |
| tool_slug | TEXT | Tool being viewed |
| tool_name | TEXT | Human-readable tool name |
| source | TEXT | Traffic source |
| medium | TEXT | Traffic medium |
| campaign | TEXT | Campaign name |
| entry_page | TEXT | First page visited |
| exit_page | TEXT | Page being abandoned |
| time_on_page | INTEGER | Seconds on page |
| scroll_depth | INTEGER | Max scroll % |
| abandonment_type | TEXT | exit_intent, tab_close, timeout, etc. |
| recovery_status | TEXT | pending, email_sent, recovered, etc. |
| recovery_channel | TEXT | email, push, retargeting, etc. |
| recovery_attempts | INTEGER | Number of recovery attempts |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Last update timestamp |

### abandoned_carts Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique identifier |
| session_id | TEXT | Session identifier |
| items | TEXT | JSON array of cart items |
| total_value | REAL | Cart total value |
| currency | TEXT | Currency code |
| recovery_status | TEXT | Recovery status |
| created_at | TEXT | Creation timestamp |

## Email Recovery Sequences

### Default Recovery Sequence (25-35% target recovery)

#### Email 1: First Reminder (1 Hour)
```
Subject: ⏰ You left this {tool_name} behind!

Hi {visitor_name},

We noticed you were checking out {tool_name} but didn't complete your signup.

Here's a special recovery link just for you:
[Complete Your Signup →]

This link will skip the wait and get you started immediately.

Best,
The Team
```

#### Email 2: Second Reminder (24 Hours)
```
Subject: 😢 Still thinking about {tool_name}?

Hi {visitor_name},

Just checking in — we saved your spot for {tool_name}.

Your exclusive offer is still available:
[Get Started Now →]

Questions? Just reply to this email.

Best,
The Team
```

#### Email 3: Final Reminder (72 Hours)
```
Subject: 📊 Last chance: Your {tool_name} access

Hi {visitor_name},

This is your final reminder about {tool_name}.

Your recovery link expires soon, but we're extending a special bonus:
✓ Instant access
✓ Priority support
✓ {bonus_value} bonus included

[Claim Your Access →]

See you on the other side!

Best,
The Team
```

### Cart Abandonment Sequence

#### Email 1: Cart Reminder (1 Hour)
```
Subject: 🛒 You left items in your cart!

Hi {visitor_name},

You added {cart_items} to your cart but didn't complete checkout.

Your cart is saved and ready:
[Complete Checkout →]

Having trouble? Reply to this email and we'll help.

Best,
The Team
```

#### Email 2: Cart Urgency (24 Hours)
```
Subject: ⏳ Your cart will expire soon: {cart_items}

Hey {visitor_name},

Just a heads up — items in your cart are selling fast!

Complete your purchase before they run out:
[Complete Purchase →]

Best,
The Team
```

#### Email 3: Cart Final (48 Hours)
```
Subject: 😢 Your cart was cleared... or was it?

Hi {visitor_name},

We noticed you didn't complete your purchase for {cart_items}.

As a thank you for considering us, here's a special discount code:

{discount_code}

[Apply & Complete →]

Best,
The Team
```

## API Endpoints

### POST /api/abandonment/track
Records abandonment events.

**Request:**
```json
{
  "sessionId": "session_123456",
  "toolSlug": "chatgpt",
  "toolName": "ChatGPT",
  "affiliateId": "aff_abc123",
  "abandonmentType": "exit_intent",
  "timeOnPage": 45,
  "scrollDepth": 75,
  "entryPage": "/tools/chatgpt",
  "exitPage": "",
  "source": "google",
  "medium": "cpc"
}
```

**Response:**
```json
{
  "success": true,
  "abandonmentId": "abc123",
  "sessionId": "session_123456",
  "remaining": 99
}
```

### POST /api/abandonment/capture-email
Captures visitor email for recovery.

**Request:**
```json
{
  "sessionId": "session_123456",
  "email": "visitor@example.com",
  "visitorId": "visitor_abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email captured successfully",
  "sessionId": "session_123456",
  "email": "vis***@***.com"
}
```

### GET /api/abandonment/recover
Processes recovery link clicks and redirects.

**Query Parameters:**
- `sessionId`: Recovery session ID
- `recover_affiliate`: Original affiliate ID
- `recover_tool`: Tool slug
- `recover_ts`: Timestamp (for expiration check)

**Response:** 302 Redirect to tool page with attribution

### GET /api/abandonment/stats
Returns recovery metrics.

**Query Parameters:**
- `startDate`: Start date (ISO)
- `endDate`: End date (ISO)
- `channel`: Specific channel (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAbandonments": 1000,
    "pendingRecovery": 150,
    "recovered": 300,
    "recoveryRate": 30,
    "revenueRecovered": 15000,
    "channelBreakdown": [
      {
        "channel": "email",
        "totalAbandonments": 800,
        "emailsSent": 750,
        "emailsOpened": 400,
        "emailsClicked": 200,
        "recovered": 250,
        "recoveryRate": 31.25,
        "totalRevenue": 12500
      }
    ]
  }
}
```

## Frontend Integration

### Using the AbandonmentModal Component

```tsx
import { AbandonmentModal } from '@/components/abandonment';

export default function ToolPage() {
  return (
    <>
      {/* Your tool page content */}
      
      <AbandonmentModal
        toolSlug="chatgpt"
        toolName="ChatGPT"
        affiliateId="aff_abc123"
        discountCode="RECOVER10"
        bonusValue="$50"
        showOnExitIntent={true}
        showOnTimeout={true}
        timeoutSeconds={60}
        title="Wait! Don't miss out..."
        subtitle="Enter your email to unlock an exclusive offer."
      />
    </>
  );
}
```

### Using the CartAbandonmentAlert Component

```tsx
import { CartAbandonmentAlert } from '@/components/abandonment';

export default function CheckoutPage() {
  const cartItems = [
    { toolSlug: 'chatgpt', toolName: 'ChatGPT Plus', price: 20, quantity: 1 },
    { toolSlug: 'midjourney', toolName: 'Midjourney', price: 10, quantity: 1 },
  ];

  return (
    <>
      {/* Checkout content */}
      
      <CartAbandonmentAlert
        items={cartItems}
        sessionId="session_123456"
        discountCode="SAVE10"
        onCheckout={() => navigateToCheckout()}
      />
    </>
  );
}
```

### Using the useAbandonedLinkRecovery Hook

```tsx
import { useAbandonedLinkRecovery } from '@/hooks/useAbandonedLinkRecovery';

function CustomExitModal() {
  const {
    sessionId,
    isAbandonmentModalOpen,
    captureEmail,
    getRecoveryLink,
  } = useAbandonedLinkRecovery({
    toolSlug: 'chatgpt',
    toolName: 'ChatGPT',
    affiliateId: 'aff_abc123',
    enableExitIntent: true,
    enableTabClose: true,
  });

  const handleEmailSubmit = async (email: string) => {
    await captureEmail(email);
    console.log('Recovery link:', getRecoveryLink());
  };

  // Custom modal implementation...
}
```

## Recovery Rate Tracking by Channel

### Channel Metrics

| Channel | Description | Expected Recovery Rate |
|---------|-------------|------------------------|
| email | Email sequences | 25-35% |
| push | Push notifications | 15-20% |
| retargeting | Ad retargeting | 10-15% |
| sms | SMS reminders | 30-40% |
| social | Social media | 5-10% |

### Performance Dashboard

Access recovery statistics at `/admin/abandonment-stats`:

```
┌─────────────────────────────────────────────────────────────────┐
│              Abandonment Recovery Dashboard                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Total Abandonments:  1,000    Pending:  150    Recovered: 300    │
│  ─────────────────────────────────────────────────────────────  │
│  Recovery Rate: 30%         Revenue: $15,000                     │
│                                                                  │
│  ┌──────────────────────┬─────────────────┬─────────────────┐  │
│  │ Channel              │ Recovery Rate   │ Revenue         │  │
│  ├──────────────────────┼─────────────────┼─────────────────┤  │
│  │ Email                │ 31.25% (250/800)│ $12,500         │  │
│  │ SMS                  │ 35.00% (35/100) │ $2,000          │  │
│  │ Push                  │ 18.00% (18/100) │ $500            │  │
│  └──────────────────────┴─────────────────┴─────────────────┘  │
│                                                                  │
│  Recent Abandonments:                                            │
│  • john@example.com - ChatGPT - Email Sent                       │
│  • jane@example.com - Midjourney - Pending                       │
│  • bob@example.com - Claude - Recovered ($50)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Privacy & Compliance

### GDPR Compliance
- Email capture is opt-in only
- Users can opt out via unsubscribe link
- Data retention: 90 days for abandoned records
- Full data deletion on request

### Cookie Management
- Session cookie: 30 days
- No cross-site tracking
- SameSite=Lax for all cookies

## Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_DOMAIN=example.com

# Optional
ABANDONMENT_EMAIL_PROVIDER=resend  # Email provider (resend, sendgrid)
ABANDONMENT_FROM_EMAIL=noreply@example.com
ABANDONMENT_REPLY_TO=support@example.com
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| exitIntentThreshold | 100 | Mouse Y position to trigger exit intent |
| timeoutSeconds | 60 | Seconds before timeout abandonment |
| maxRecoveryAttempts | 5 | Maximum recovery attempts per session |
| recoveryLinkExpiry | 24 | Hours before recovery link expires |
| emailSequence | default | Email template sequence to use |

## Expected Results

Based on industry benchmarks and our implementation:

| Metric | Expected Value |
|--------|----------------|
| Exit Intent Capture Rate | 3-5% of sessions |
| Email Capture Rate | 40-60% of shown modals |
| Email Open Rate | 20-30% |
| Email Click Rate | 10-15% |
| **Overall Recovery Rate** | **25-35%** |
| Revenue Recovery | 15-25% of lost cart value |

## Troubleshooting

### Common Issues

1. **Modal not showing**
   - Check if `enableExitIntent` is true
   - Verify mouse is moving above page threshold
   - Check browser console for errors

2. **Emails not sending**
   - Verify email provider configuration
   - Check spam folder
   - Validate email format

3. **Recovery links not working**
   - Check session ID expiration
   - Verify affiliate attribution
   - Check server logs for errors

### Debug Mode

Enable debug logging:

```typescript
// In your code
const debug = process.env.NODE_ENV === 'development';

// Logs will appear in console when debug is true
if (debug) {
  console.log('[Abandonment] Recording exit:', abandonmentData);
}
```

## Future Enhancements

- [ ] AI-powered email personalization
- [ ] SMS recovery integration
- [ ] Push notification support
- [ ] Multi-language email templates
- [ ] A/B testing for modal variations
- [ ] Predictive abandonment scoring
- [ ] Integration with CRM systems

## Support

For issues or questions:
- Check `/admin/abandonment-stats` for real-time metrics
- Review server logs for errors
- Contact: support@example.com
