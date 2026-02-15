#!/usr/bin/env python3
import os
import subprocess
import json

# Load JULES_API_KEY from environment
api_key = os.environ.get('JULES_API_KEY')
if not api_key:
    print("Error: JULES_API_KEY environment variable not set")
    exit(1)

# Base payload template
def create_payload(title, issue_body):
    return {
        "prompt": issue_body,
        "sourceContext": {
            "source": "sources/github/yuga-hashimoto/ai-tool-navigator",
            "githubRepoContext": {"startingBranch": "main"}
        },
        "automationMode": "AUTO_CREATE_PR",
        "title": title
    }

# Issues data
issues = [
    {
        "number": 382,
        "title": "#382: Automated Abandoned Cart Recovery (Premium)",
        "body": """## Summary
Implement an automated abandoned cart recovery system that sends timely, personalized emails to recover abandoned carts and convert them into purchases.

## Expected Impact
- 25-35% cart recovery rate
- 15-25% additional revenue
- 10-15% email engagement increase

## Implementation Requirements

### Backend
- **Cart Tracking**: Track cart state:
  - Items in cart
  - Cart total
  - Abandonment timestamp
  - User ID
  - Page views before abandonment
- **Abandonment Detection**: Identify abandoned carts:
  - Cart created but not completed within timeframe
  - Cart items removed
  - Session expired
  - Tab closed without checkout
- **Recovery Engine**: Automated recovery system:
  - Multi-email sequence (3-5 emails)
  - Personalized content based on cart items
  - Different messaging for different abandonment types
  - Time-based triggers (1h, 24h, 48h, 72h)
- **Email Campaign Management**:
  - Create and manage recovery campaigns
  - Test different email templates
  - Set up A/B tests
  - Track campaign performance

### Frontend
- **Cart Abandonment Tracking**: Track user behavior:
  - Mouse movement on cart page
  - Time on cart page
  - Pages visited before abandoning
  - Add to cart events
- **Recovery Email Templates**: Pre-built templates:
  - Reminder emails
  - Last-chance offers
  - Social proof emails
  - Personalized recommendations

### Features
1. **1-Hour Reminder**: First recovery email:
  - "Don't lose your cart"
  - "Complete your purchase"
  - "Your items are reserved"
2. **24-Hour Reminder**: Second email:
  - "Still interested?"
  - "Complete your purchase"
  - "Save 10% for 24 hours"
3. **48-Hour Reminder**: Third email:
  - "Last chance to save"
  - "Your items are expiring"
  - "Exclusive discount for you"
4. **72-Hour Reminder**: Fourth email:
  - "Still thinking?"
  - "Complete your purchase"
  - "Your items are waiting"
5. **Personalization**: Personalized content:
  - Show exact cart items
  - Show cart total
  - Show savings amount
  - Show countdown timer
6. **Offer Integration**: Discount codes:
  - Auto-generated discount codes
  - One-time use codes
  - Time-limited codes
7. **A/B Testing Framework**:
  - Test different subject lines
  - Test different content
  - Test different timing
  - Test different offers
8. **Analytics Dashboard**:
  - Abandonment rate
  - Recovery rate by email
  - Revenue recovered
  - Email open rate
  - Click-through rate

### Tech Stack
- Supabase Database for cart data
- Next.js 14 for cart tracking
- Email API (Resend or similar) for recovery emails
- NextAuth.js for user identification
- Segment.js for behavior tracking
- Redis for cart state caching

### Success Metrics
- Abandonment rate: Current baseline
- Recovery rate: 25-35% improvement
- Revenue recovered: 15-25%
- Email open rate: 25-35%
- Click-through rate: 8-12%
- Discount code usage: 40-60%

## Dependencies
- #304: Exit Intent Optimization (similar tracking logic)
- #350: Real-Time Notification System (for push notifications)
- #371: AI-Powered Personalized Email Marketing (for personalization)

## Implementation Phases
1. Cart Tracking & Abandonment Detection (2 days)
2. Recovery Email System (3 days)
3. Personalization Engine (2 days)
4. A/B Testing Framework (2 days)
5. Analytics Dashboard (2 days)
6. Testing & Launch (2 days)

Total: 13 days"""
    },
    {
        "number": 381,
        "title": "#381: Post-Purchase Upsell Sequence Automation",
        "body": """## Summary
Implement automated post-purchase upsell sequences that offer additional products or services after a customer completes a purchase.

## Expected Impact
- 10-15% additional revenue per customer
- 8-12% upsell conversion rate
- 5-10% customer lifetime value increase

## Implementation Requirements

### Backend
- **Purchase Event Tracking**: Track purchase events:
  - Product purchased
  - Purchase amount
  - User ID
  - Purchase timestamp
  - Cart contents
- **Upsell Logic Engine**:
  - Rule-based upsell recommendations
  - Product bundling rules
  - Tier-based upsell logic
  - Product category rules
  - Purchase history analysis
- **Upsell Campaign Management**:
  - Create and manage upsell campaigns
  - Define upsell timing (immediate, 1h, 24h, 72h)
  - Set upsell rules and conditions
  - Configure upsell offers
  - Track campaign performance
- **Email Integration**: Automated email sequences:
  - Post-purchase email templates
  - A/B test subject lines and content
  - Timing automation
  - Personalization integration

### Frontend
- **Upsell Widget**: Post-purchase upsell display:
  - Immediate upsell page (after checkout success)
  - Upsell modal on thank you page
  - Clear value proposition
  - Prominent CTA buttons
  - Urgency indicators
- **Upsell Configuration**: Admin settings:
  - Upsell rules and conditions
  - Upsell offers and pricing
  - Timing and frequency controls
  - Target audience segmentation
- **Analytics Dashboard**: Track upsell performance:
  - Upsell impression rate
  - Click-through rate
  - Conversion rate
  - Revenue impact
  - A/B test results

### Features
1. **Immediate Upsell**: Show upsell immediately after purchase:
  - Best offer based on purchase
  - Time-limited offer
  - Personalized recommendation
2. **1-Hour Follow-Up**: Email or push notification:
  - "Complete your order"
  - "Add related items"
  - "Get free shipping"
3. **24-Hour Reminder**: Email or push:
  - "Still interested?"
  - "Your items are ready"
  - "Last chance to save"
4. **72-Hour Cross-Sell**: Email:
  - Related products
  - Bundle deals
  - Exclusive discounts
5. **Product Bundles**: Pre-configured bundles:
  - Essential bundle
  - Premium bundle
  - Pro bundle
  - User-specified bundles
6. **Tier-Based Upsell**:
  - Free upsell for new users
  - Discounted upsell for returning users
  - Premium upsell for VIP users
7. **A/B Testing Framework**:
  - Test different offers
  - Test different timing
  - Test different messaging
8. **Analytics Dashboard**:
  - Upsell impression rate
  - Click-through rate
  - Conversion rate
  - Revenue impact
  - Per-campaign comparison

### Tech Stack
- Supabase Database for upsell campaigns and data
- Next.js 14 for upsell pages and widgets
- NextAuth.js for user identification
- Email API (Resend or similar) for email sequences
- Push notification service for instant offers
- Segment.js for tracking

### Success Metrics
- Immediate upsell conversion: 8-12%
- Follow-up email open rate: 25-35%
- Cross-sell revenue: 10-15% additional revenue
- Customer lifetime value: 5-10% increase
- Customer satisfaction: >85%

## Dependencies
- #326: Comprehensive Loyalty Points System
- #351: Error Handling & System Monitoring
- Existing checkout and email infrastructure

## Implementation Phases
1. Purchase Tracking & Event System (2 days)
2. Upsell Logic Engine (3 days)
3. Upsell Widgets & Pages (2 days)
4. Email Sequence System (2 days)
5. Analytics Dashboard (2 days)
6. Testing & Launch (2 days)

Total: 13 days"""
    },
    {
        "number": 380,
        "title": "#380: Cross-Sell Recommendations Engine",
        "body": """## Summary
Implement an intelligent cross-sell recommendations engine that suggests complementary products and services based on user behavior, preferences, and purchase history.

## Expected Impact
- 15-25% AOV (Average Order Value) increase
- 10-15% conversion rate increase
- 5-10% revenue growth

## Implementation Requirements

### Backend
- **Product Catalog**: Database schema for:
  - Products/services with metadata
  - Categories and subcategories
  - Product relationships (cross-sell, upsell)
  - Product attributes
- **Recommendation Engine**:
  - Collaborative filtering (users who bought X also bought Y)
  - Content-based filtering (similar products)
  - Hybrid recommendation system
  - User behavior tracking
- **User Behavior Tracking**: Track:
  - Page views
  - Search queries
  - Click-through rates
  - Purchase history
  - Time spent on product pages
- **Recommendation API**:
  - Real-time recommendations
  - Personalized recommendations
  - Cross-sell suggestions
  - Upsell suggestions

### Frontend
- **Recommendation Widgets**: Placement options:
  - Product recommendations on product pages
  - Related products in cart
  - Cross-sell banner
  - Upsell modal
  - "Customers also bought" section
- **Recommendation Display**: Personalized content:
  - Product images
  - Prices and discounts
  - Availability status
  - Clear CTA buttons
- **Analytics Integration**: Track:
  - Recommendation impression rate
  - Click-through rate
  - Conversion rate
  - Revenue impact

### Features
1. **Product Page Recommendations**: Show related products:
  - Based on user behavior
  - Based on other users' behavior
  - Based on category similarity
2. **Cart Cross-Sell**: Suggest complementary products:
  - Based on items in cart
  - Based on cart value
  - Based on purchase history
3. **Checkout Upsell**: Last-minute upsell offers:
  - Based on items being purchased
  - Based on cart total
  - Time-based (last step before checkout)
4. **Email Recommendations**: Personalized product recommendations:
  - Post-purchase emails
  - Abandoned cart emails
  - Welcome emails
  - Re-engagement emails
5. **Search Recommendations**: Related products in search results:
  - Query-based recommendations
  - Popular results
  - User-specific results
6. **A/B Testing**: Test different recommendation strategies:
  - Different algorithms
  - Different placements
  - Different product sets
7. **Analytics Dashboard**: Track performance:
  - Impressions per widget
  - Click-through rate
  - Conversion rate
  - Revenue attribution
  - A/B test results

### Tech Stack
- Supabase Database for product and recommendation data
- Supabase Vector Store for AI embeddings
- Supabase Edge Functions for recommendation engine
- Next.js 14 + shadcn/ui for widgets
- Segment.js for behavior tracking
- Redis for caching recommendations

### Success Metrics
- AOV increase: 15-25%
- Cross-sell conversion rate: 10-15%
- Upsell conversion rate: 8-12%
- Recommendation click-through rate: 10-15%
- Revenue impact: 5-10%

## Dependencies
- #344: AI-Powered Product Recommendations (foundation)
- #378: A/B Testing Framework
- Existing product catalog

## Implementation Phases
1. Product Catalog Enhancement (2 days)
2. Recommendation Engine (3 days)
3. Behavior Tracking Integration (2 days)
4. Widget Components (2 days)
5. Email Integration (2 days)
6. Analytics Dashboard (2 days)
7. Testing & Launch (2 days)

Total: 15 days"""
    }
]

# Make API requests
results = []
for issue in issues:
    payload = create_payload(issue['title'], issue['body'])
    url = 'https://jules.googleapis.com/v1alpha/sessions'
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key
    }

    try:
        response = subprocess.run(
            ['curl', '-s', '-X', 'POST', url, '-H', json.dumps(headers), '-d', json.dumps(payload)],
            capture_output=True,
            text=True
        )
        result = json.loads(response.stdout)
        results.append({
            'issue': issue['number'],
            'title': issue['title'],
            'result': result
        })
        print(f"✓ Started Jules session for {issue['number']}: {issue['title']}")
        print(f"  Response: {json.dumps(result, indent=2)}")
        print()
    except Exception as e:
        results.append({
            'issue': issue['number'],
            'title': issue['title'],
            'error': str(e)
        })
        print(f"✗ Error starting Jules session for {issue['number']}: {e}")
        print()

# Save results to a file
output_file = '/Users/yu-ga/.clawdbot/agents/monetize-agent/jules_results.json'
with open(output_file, 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nAll Jules sessions started. Results saved to {output_file}")
