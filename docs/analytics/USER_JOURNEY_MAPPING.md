# User Journey Mapping Documentation

## Overview

This document outlines the comprehensive user journey tracking implementation for AI Tool Navigator using Google Analytics 4 (GA4). The goal is to understand user behavior, identify friction points, and optimize the user experience for better engagement and conversions.

---

## 1. User Journey Stages

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY FLOW DIAGRAM                          │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
    │LANDING  │────▶│DISCOVERY│────▶│CONSIDER │────▶│DECISION │────▶│CONVERSION│
    │(Home)   │     │(Browse) │     │ATION    │     │(Compare)│     │(Signup) │
    └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
         │               │               │               │               │
         ▼               ▼               ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
    │Entry    │     │Search   │     │Tool     │     │Compare  │     │Affiliate│
    │Point    │     │Filters  │     │Detail   │     │Selection│     │Click    │
    └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
```

### Stage Definitions

| Stage | Description | Key Metrics |
|-------|-------------|-------------|
| **Landing** | User arrives on site (first touchpoint) | Sessions, Entry pages, Bounce rate |
| **Discovery** | Browsing tools, categories, search | Tool views, Search queries, Filter usage |
| **Consideration** | Viewing tool details, comparing options | Time on page, Scroll depth, Content engagement |
| **Decision** | Final selection, comparing multiple tools | Compare actions, Return visits |
| **Conversion** | Taking action (signup, purchase) | Affiliate clicks, Newsletter signups, External conversions |

---

## 2. Key User Flows

### Flow A: Tool Browsing Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    TOOL BROWSING JOURNEY MAP                              │
└──────────────────────────────────────────────────────────────────────────┘

  User Action          GA4 Event                Tracking Point
  ─────────────────────────────────────────────────────────────────────────
  
  ┌─────────┐
  │ Homepage│◀── Entry (direct, search, referral)
  │   /     │
  └────┬────┘
       │ click "Browse Tools" or scroll
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │  Tool   │────▶│ Impression: track_tool_impression │
  │  Grid   │     │ (position, category, list name)    │
  └────┬────┘     └─────────────────────────────────────┘
       │
       │ click specific tool
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │   Tool  │────▶│ View: track_tool_view              │
  │  Detail │     │ (slug, category, rating, price)    │
  └────┬────┘     └─────────────────────────────────────┘
       │
       │ click affiliate link
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │External │────▶│ Conversion: track_affiliate_click   │
  │  Site   │     │ (tool, position, timestamp)         │
  └─────────┘     └─────────────────────────────────────┘
```

### Flow B: Search Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      SEARCH JOURNEY MAP                                   │
└──────────────────────────────────────────────────────────────────────────┘

  User Action          GA4 Event                Tracking Point
  ─────────────────────────────────────────────────────────────────────────
  
  ┌─────────┐
  │ Search  │◀── Enter search query
  │  Input  │
  └────┬────┘
       │ type query (debounced)
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │  Query  │────▶│ Search: track_search                │
  │ Submitted│     │ (term, results count)               │
  └────┬────┘     └─────────────────────────────────────┘
       │
       │ view results
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │ Results │────▶│ Impression: track_tool_impression  │
  │  Page   │     │ (list_name: "search_results")       │
  └────┬────┘     └─────────────────────────────────────┘
       │
       │ click result #N
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │  Click  │────▶│ Click: track_search_result_click    │
  │ Result  │     │ (term, tool, position)              │
  └─────────┘     └─────────────────────────────────────┘
```

### Flow C: Comparison Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    COMPARISON JOURNEY MAP                                 │
└──────────────────────────────────────────────────────────────────────────┘

  User Action          GA4 Event                Tracking Point
  ─────────────────────────────────────────────────────────────────────────
  
  ┌─────────┐
  │  Tool   │◀── View tool card
  │  Card   │
  └────┬────┘
       │ click "Compare"
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │   Add   │────▶│ Add: track_add_to_compare          │
  │  To     │     │ (tool, category, compare count)    │
  │ Compare │     └─────────────────────────────────────┘
  └────┬────┘
       │
       │ repeat for 2-4 tools
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │ Compare │────▶│ View: track_comparison_view        │
  │  Page   │     │ (tools compared, count)            │
  └────┬────┘     └─────────────────────────────────────┘
       │
       │ analyze options
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │ Decision│────▶│ Track: track_journey_stage         │
  │         │     │ (stage: decision)                   │
  └─────────┘     └─────────────────────────────────────┘
       │
       │ click affiliate link
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │External │────▶│ Conversion: track_affiliate_click   │
  │  Site   │     │ (compare_context: true)            │
  └─────────┘     └─────────────────────────────────────┘
```

### Flow D: Newsletter/Lead Generation Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 NEWSLETTER LEAD GEN JOURNEY MAP                            │
└──────────────────────────────────────────────────────────────────────────┘

  User Action          GA4 Event                Tracking Point
  ─────────────────────────────────────────────────────────────────────────
  
  ┌─────────┐
  │ Browse  │◀── Page view
  │  Site   │
  └────┬────┘
       │ stay 30+ seconds
       ▼
  ┌─────────┐     ┌─────────────────────────────────────┐
  │ Popup   │────▶│ View: track_popup_view             │
  │ Trigger │     │ (newsletter_popup)                 │
  └────┬────┘     └─────────────────────────────────────┘
       │
       │ dismiss
       ▼                    OR          ┌─────────────────────────────┐
  ┌─────────┐     ┌───────────┐         │ Submit: track_newsletter_   │
  │ Dismiss │────▶│ Dismiss   │────────▶│ signup (method, location)  │
  └─────────┘     └───────────┘         └─────────────────────────────┘
```

---

## 3. GA4 Event Tracking Matrix

### Core Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `page_view` | Route change | page_path, page_title |
| `session_start` | First visit | session_source, session_medium |
| `tool_impression` | Tool in viewport | tool_slug, tool_name, category, position |
| `tool_click` | Click tool card | tool_slug, tool_name, category, position |
| `view_item` | Tool detail view | item_id, item_name, category |
| `search` | Search submit | search_term, results_count |
| `search_result_click` | Click search result | search_term, tool_slug, position |
| `add_to_compare` | Add to compare | tool_slug, compare_count |
| `view_comparison` | View compare page | tools_compared |
| `begin_checkout` | Click affiliate | currency, value, items[] |
| `affiliate_click` | Affiliate link | tool_slug, click_location |
| `sign_up` | Newsletter submit | method, location |
| `scroll` | Scroll milestones | percent_scrolled, section |
| `timing_complete` | Page exit | value (seconds), page_path |
| `popup_view` | Popup display | popup_name |
| `popup_dismiss` | Dismiss popup | popup_name, reason |
| `view_category` | Category page | category_name, item_count |
| `apply_filter` | Apply filter | filter_type, filter_value |
| `share` | Social share | method, content_type |
| `journey_stage` | Stage change | stage (landing/discovery/consideration/decision/conversion) |

### Custom Dimensions

| Dimension | Description | Scope |
|-----------|-------------|-------|
| `dimension1` | journey_stage | User |
| `dimension2` | tool_category | Hit |
| `dimension3` | user_segment | User |
| `dimension4` | content_type | Hit |

### Custom Metrics

| Metric | Description | Scope |
|--------|-------------|-------|
| `metric1` | scroll_depth | Hit |
| `metric2` | time_on_page | Hit |
| `metric3` | affiliate_clicks | Event |
| `metric4` | conversion_value | Event |

---

## 4. Friction Point Identification

### High Friction Areas

#### 1. **Search to Tool Detail Drop-off**
```
Trigger: High `search` events but low `search_result_click`
Analysis: Users search but don't click results
Impact: 70%+ drop-off at this stage is problematic
Action: Improve search result quality, add rich snippets
```

#### 2. **Tool Detail to Affiliate Click**
```
Trigger: High `view_item` but low `begin_checkout`
Analysis: Users view tools but don't convert
Impact: Low conversion rate on tool pages
Action: Improve CTA placement, add urgency, improve trust signals
```

#### 3. **Newsletter Popup Dismissal**
```
Trigger: High `popup_view` but low `sign_up`, high `popup_dismiss`
Analysis: Popup fatigue
Impact: User annoyance, potential SEO impact (time on site)
Action: Test timing, frequency, messaging; offer alternative capture
```

#### 4. **Comparison Abandonment**
```
Trigger: Users add to compare but don't complete
Analysis: Compare feature not leading to conversion
Impact: Missing conversion opportunity
Action: Simplify comparison UI, add clear CTAs
```

### Metric Thresholds

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Bounce Rate | < 40% | 40-60% | > 60% |
| Tool CTR from Search | > 15% | 8-15% | < 8% |
| Affiliate Conversion | > 5% | 2-5% | < 2% |
| Newsletter Signup Rate | > 3% | 1-3% | < 1% |
| Avg. Time on Page | > 2 min | 1-2 min | < 1 min |
| Scroll to 75% | > 50% | 30-50% | < 30% |

---

## 5. GA4 Configuration Steps

### Step 1: Enable Enhanced Measurement
- In GA4 Admin → Data Stream → Enhanced Measurement
- Enable: Scrolls, Outbound clicks, File downloads, Video engagement

### Step 2: Create Custom Definitions
- Go to GA4 Admin → Custom Definitions
- Create 4 custom dimensions:
  - `journey_stage` (User scope)
  - `tool_category` (Hit scope)
  - `user_segment` (User scope)
  - `content_type` (Hit scope)
- Create 4 custom metrics:
  - `scroll_depth` (Hit)
  - `time_on_page` (Hit)
  - `affiliate_clicks` (Event)
  - `conversion_value` (Event)

### Step 3: Set Up Key Events
- `begin_checkout` → Mark as conversion
- `sign_up` → Mark as conversion
- `affiliate_click` → Mark as conversion
- `generate_lead` → Mark as conversion (newsletter)

### Step 4: Create Audiences
- `High Intent Users`: Used compare 2+ times in session
- `Tool Browsers`: Viewed 5+ tools in session
- `Converted Users`: Completed affiliate click or signup
- `Newsletter Subscribers`: Signed up via newsletter

### Step 5: Set Up Funnels
Create these funnels in GA4 Explorations:

**Funnel 1: Tool Browsing**
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

---

## 6. Implementation Files

### File Structure

```
src/
├── lib/
│   ├── analytics.ts              # Original GA4 wrapper
│   └── analytics-journey.ts      # Enhanced journey tracking
├── components/
│   ├── GoogleAnalytics.tsx       # GA4 initialization
│   ├── JourneyTracker.tsx        # Journey stage tracking
│   ├── EngagementTracker.tsx     # Content engagement tracking
│   ├── ToolGrid.tsx              # Updated with journey tracking
│   └── ToolCard.tsx              # Enhanced impression tracking
├── app/
│   └── [locale]/
│       ├── layout.tsx            # GoogleAnalytics component
│       ├── page.tsx              # Home page tracking
│       ├── tools/
│       │   └── [slug]/
│       │       └── page.tsx       # Tool detail tracking
│       └── category/
│           └── [slug]/
│               └── page.tsx      # Category page tracking
```

---

## 7. Actionable Recommendations

### Immediate Actions (Week 1-2)

1. **Add Journey Stage Tracking**
   - Implement `JourneyTracker` component on all pages
   - Set up custom dimensions in GA4
   - Create audience segments for each stage

2. **Improve Search Tracking**
   - Ensure debounced search tracking is working
   - Add `search_result_click` tracking
   - Create search abandonment funnel

3. **Fix Tool Card Tracking**
   - Add impression tracking with IntersectionObserver
   - Track position in grid
   - Track list source (home, category, search)

### Short-term Improvements (Month 1)

1. **Reduce Search Drop-off**
   - A/B test search result ordering
   - Add tool thumbnails to results
   - Implement "Recent searches" feature

2. **Increase Affiliate Conversion**
   - A/B test CTA button placement
   - Add trust signals (verified badges, reviews)
   - Test different button copy ("Try Free", "Get Started")

3. **Optimize Newsletter Popup**
   - Test different triggers (time vs scroll vs exit intent)
   - Experiment with popup frequency
   - Test popup vs inline form

### Long-term Optimizations (Quarter 1+)

1. **Personalization**
   - Use journey stage for personalized content
   - Recommend tools based on browsing history
   - Retarget users in consideration stage

2. **Conversion Rate Optimization**
   - Build full funnel analysis
   - Identify and fix drop-off points
   - A/B test entire journey paths

3. **Advanced Analytics**
   - Implement predictive analytics
   - Build custom ML models for conversion prediction
   - Create real-time dashboards

---

## 8. Monitoring & KPIs

### Weekly Metrics to Track

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Sessions | 10,000+ | ___ | ⚪ |
| Avg. Session Duration | 2:30+ | ___ | ⚪ |
| Tool Page Views | 25,000+ | ___ | ⚪ |
| Search CTR | 15%+ | ___ | ⚪ |
| Affiliate Clicks | 500+/mo | ___ | ⚪ |
| Newsletter Signups | 300+/mo | ___ | ⚪ |
| Bounce Rate | < 50% | ___ | ⚪ |

### Monthly Reports

1. **Journey Analysis Report**
   - Stage progression rates
   - Drop-off analysis
   - Top exit points

2. **Conversion Report**
   - Funnel completion rates
   - A/B test results
   - ROI analysis

3. **Content Performance**
   - Most/least viewed tools
   - Engagement by category
   - Search query analysis

---

## 9. Testing & Validation

### Debug Tools

```javascript
// Enable GA4 debug mode in console
window.gtag('set', 'debug_mode', true);

// Log all events
window.dataLayer.push = function(...args) {
  console.log('GA4 Event:', ...args);
  return originalPush.apply(this, args);
};
```

### Validation Checklist

- [ ] Page views are tracked on all routes
- [ ] Tool impressions trigger when tools enter viewport
- [ ] Search events fire after debounce
- [ ] Affiliate clicks are tracked
- [ ] Custom dimensions are populated
- [ ] Funnel reports show data
- [ ] Audiences are building correctly
- [ ] No duplicate events are firing

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-13 | Analytics Team | Initial implementation |

---

*Last Updated: 2026-02-13*
