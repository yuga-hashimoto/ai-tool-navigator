# User Journey Mapping - Implementation Summary

## Overview

This document summarizes the implementation of comprehensive user journey mapping for AI Tool Navigator using Google Analytics 4 (GA4). The goal is to track user behavior across all key flows, identify friction points, and enable data-driven optimization.

---

## Files Created/Modified

### New Files

| File | Description |
|------|-------------|
| `src/lib/analytics-journey.ts` | Enhanced analytics library with all journey tracking functions |
| `src/components/JourneyTracker.tsx` | Components for tracking journey stages, scroll depth, and time on page |
| `src/components/EngagementTracker.tsx` | Components for tracking content engagement and tool details |
| `src/components/ToolImpressionObserver.tsx` | IntersectionObserver-based tool impression tracking |
| `docs/analytics/USER_JOURNEY_MAPPING.md` | Comprehensive documentation with diagrams and recommendations |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/GoogleAnalytics.tsx` | Enhanced GA4 configuration with custom dimensions/metrics |
| `src/components/ToolGrid.tsx` | Added impression tracking, search tracking, category filtering |
| `src/components/ToolCard.tsx` | Added click tracking with position and list context |
| `src/app/[locale]/page.tsx` | Added JourneyTracker and ScrollTracker components |
| `src/app/[locale]/tools/[slug]/page.tsx` | Added tool detail tracking and engagement tracking |
| `src/app/[locale]/category/[slug]/page.tsx` | Added category journey tracking |
| `src/lib/analytics.ts` | Extended with all journey tracking functions |

---

## Key Features Implemented

### 1. Enhanced GA4 Configuration
- Custom dimensions: journey_stage, tool_category, user_segment, content_type
- Custom metrics: scroll_depth, time_on_page, affiliate_clicks, conversion_value
- Enhanced measurement settings
- Cross-domain tracking configuration

### 2. User Journey Stage Tracking
- Landing stage (homepage entry)
- Discovery stage (browsing, search, categories)
- Consideration stage (tool detail views)
- Decision stage (comparison actions)
- Conversion stage (affiliate clicks, signups)

### 3. Tool Browsing Tracking
- Tool impressions with position and list name
- Tool clicks with context
- Tool detail page views
- Related tools tracking

### 4. Search Journey Tracking
- Search queries with debounce
- Search result impressions
- Search result clicks
- Search abandonment analysis

### 5. Comparison Tracking
- Add to compare events
- Comparison page views
- Compare selection changes

### 6. Engagement Metrics
- Scroll depth tracking (25%, 50%, 75%, 100%)
- Time on page tracking
- Content engagement tracking

### 7. Monetization Tracking
- Affiliate link clicks
- Ad impressions
- Ad clicks

### 8. Lead Generation Tracking
- Newsletter popup views
- Newsletter signups
- Popup dismissals

---

## GA4 Configuration Required

### Step 1: Enable Enhanced Measurement
1. Go to GA4 Admin → Data Stream → Your Stream
2. Enable Enhanced Measurement:
   - Scrolls: ✓
   - Outbound clicks: ✓
   - File downloads: ✓
   - Video engagement: ✓
   - Site search: ✓

### Step 2: Create Custom Definitions

**Custom Dimensions:**
| Name | Scope | Parameter Name |
|------|-------|----------------|
| journey_stage | User | journey_stage |
| tool_category | Hit | tool_category |
| user_segment | User | user_segment |
| content_type | Hit | content_type |

**Custom Metrics:**
| Name | Scope | Parameter Name |
|------|-------|----------------|
| scroll_depth | Hit | percent_scrolled |
| time_on_page | Hit | value |
| affiliate_clicks | Event | - |
| conversion_value | Event | value |

### Step 3: Set Up Key Events (Conversions)

Mark these events as conversions:
1. `begin_checkout` (affiliate click)
2. `sign_up` (newsletter)
3. `affiliate_click`
4. `generate_lead`
5. `tool_impression` (optional)

### Step 4: Create Audiences

1. **High Intent Users**: Used compare 2+ times in session
2. **Tool Browsers**: Viewed 5+ tools in session
3. **Converted Users**: Completed affiliate click or signup
4. **Newsletter Subscribers**: Signed up via newsletter
5. **Search Abandoners**: Searched but no click within session

### Step 5: Create Funnels

**Funnel 1: Tool Browsing Conversion**
1. `page_view` (homepage)
2. `tool_impression`
3. `tool_click`
4. `view_item`
5. `begin_checkout`

**Funnel 2: Search Conversion**
1. `search`
2. `tool_impression`
3. `search_result_click`
4. `view_item`
5. `begin_checkout`

**Funnel 3: Newsletter Signup**
1. `page_view`
2. `scroll` (50%)
3. `popup_view`
4. `sign_up`

**Funnel 4: Compare to Convert**
1. `page_view`
2. `add_to_compare`
3. `view_comparison`
4. `begin_checkout`

---

## Friction Points to Monitor

### High Priority

1. **Search to Click Drop-off**
   - Trigger: High `search` events but low `search_result_click`
   - Action: Improve search result quality, add rich snippets

2. **Tool View to Affiliate Click**
   - Trigger: High `view_item` but low `begin_checkout`
   - Action: Improve CTA placement, add trust signals

3. **Newsletter Popup Fatigue**
   - Trigger: High `popup_view` but low `sign_up`, high `popup_dismiss`
   - Action: Test timing, frequency, messaging

### Medium Priority

4. **Category Filter Usage**
   - Trigger: Low `apply_filter` events
   - Action: Improve filter UI visibility

5. **Comparison Abandonment**
   - Trigger: Users add to compare but don't convert
   - Action: Simplify comparison UI, add clear CTAs

---

## Recommended KPIs

### Weekly Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Sessions | 10,000+ | ___ |
| Avg. Session Duration | 2:30+ | ___ |
| Tool Page Views | 25,000+ | ___ |
| Search CTR | 15%+ | ___ |
| Affiliate Clicks | 500+/mo | ___ |
| Newsletter Signups | 300+/mo | ___ |
| Bounce Rate | < 50% | ___ |

### Funnel Metrics

| Funnel | Conversion Rate |
|--------|----------------|
| Browse → Tool Click | ___% |
| Search → Click | ___% |
| Tool View → Affiliate | ___% |
| Compare → Convert | ___% |
| Popup → Signup | ___% |

---

## Testing Checklist

- [ ] Page views are tracked on all routes
- [ ] Tool impressions trigger when tools enter viewport (50% visible)
- [ ] Search events fire after 1-second debounce
- [ ] Tool clicks include position and list context
- [ ] Affiliate clicks are tracked
- [ ] Custom dimensions are populated
- [ ] Custom metrics are recording values
- [ ] Funnel reports show data
- [ ] Audiences are building correctly
- [ ] No duplicate events are firing
- [ ] Newsletter signup tracking works
- [ ] Scroll depth tracking works
- [ ] Time on page tracking works

---

## Debug Mode

Enable GA4 debug mode in browser console:

```javascript
// Enable debug mode
window.gtag('set', 'debug_mode', true);

// Log all events to console
window.dataLayer.push = function(...args) {
  console.log('GA4 Event:', ...args);
  return originalPush.apply(this, args);
};
```

Or use Google Analytics Debugger Chrome extension.

---

## Next Steps

### Immediate (Week 1)
1. Complete GA4 configuration (custom definitions, conversions, audiences)
2. Deploy changes to staging
3. Verify events in GA4 Real-Time view
4. Create initial funnel reports

### Short-term (Month 1)
1. Analyze search abandonment data
2. A/B test search result improvements
3. Optimize newsletter popup timing
4. Create journey stage segments

### Long-term (Quarter 1+)
1. Build predictive models for conversion
2. Implement personalization based on journey stage
3. Create real-time dashboard for monitoring
4. Develop advanced attribution model

---

*Implementation Date: 2026-02-13*
*Version: 1.0*
