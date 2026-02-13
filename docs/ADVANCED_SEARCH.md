# Advanced Search Features Documentation

## Overview

The Advanced Search feature provides users with powerful filtering and sorting capabilities to find AI tools that match their specific needs.

## Location

- **Page URL**: `/{locale}/tools`
- **Main Component**: `src/components/ToolsPageContent.tsx`
- **Filter Component**: `src/components/FilterBar.tsx`
- **Search Component**: `src/components/SearchBar.tsx`
- **Sort Component**: `src/components/SortDropdown.tsx`
- **Active Filters Component**: `src/components/ActiveFilters.tsx`

## Features

### 1. Search Functionality

The search bar allows users to find tools by:
- Tool name (title)
- Description
- Category

**Features:**
- Debounced search (300ms delay) to prevent excessive filtering
- Clear button to reset search
- Keyboard support (Escape to clear)

### 2. Filters

#### Category Filter
- Dynamically generated from available tool categories
- Multi-select support (select multiple categories)
- Located in the filter bar

#### Rating Filter
- Filter by minimum star rating (4+, 3+, 2+, 1+)
- Toggle filter on/off by clicking again
- Visual indicator with star icon

#### Price Range Filter
- Options: All Prices, Free, Freemium, Paid
- Based on the `pricing` field in tool metadata
- Requires `pricing` field to be set in tool markdown files

#### Year Filter
- Dynamically extracted from tool's `last_updated` field
- Multi-select support
- Shows years available in the tool collection

#### Platform Filter
- Options: Web, Mobile, Desktop
- Simple detection based on tool category keywords
- Multi-select support

### 3. Sorting Options

| Option | Description | Sort Criteria |
|--------|-------------|---------------|
| Popularity (default) | Featured/sponsored tools first, then by rating | `featured > sponsored > rating` |
| Rating | Highest rated tools first | `rating (desc)` |
| Most Recent | Newest tools first | `last_updated (desc)` |
| Name (A-Z) | Alphabetical order | `title (asc)` |

### 4. Active Filters Display

When filters are applied:
- Shows a row of active filter tags
- Each tag has a remove button (X)
- "Clear all" button to reset all filters
- Shows current filter count

### 5. Responsive Design

**Desktop:**
- Filters displayed horizontally in a row
- Search bar centered above filters
- Sort dropdown on the right side

**Mobile:**
- Collapsible filter panel (accordion style)
- Filter count badge on toggle button
- Full-width search bar
- Stacked layout for better usability

## Data Structure

### Tool Metadata Fields (Updated)

The following fields have been added to support advanced filtering:

```typescript
interface ToolMetadata {
  // ... existing fields
  
  // New fields for advanced search
  pricing?: 'free' | 'freemium' | 'paid' | 'contact';
  price?: string;
  platform?: ('Web' | 'Mobile' | 'Desktop')[];
}
```

### Example Tool Markdown

```yaml
---
title: "ChatGPT"
slug: "chatgpt"
category: "Coding"
description: "The AI chatbot..."
rating: 4.9
pricing: "freemium"  // For price filter
platform: ["Web"]     // For platform filter
last_updated: "2026-02-13"
# ... other fields
---
```

## Usage

### For Users

1. **Basic Search**: Type in the search bar to find tools by name or description
2. **Apply Filters**: Click on filter options to narrow down results
3. **Combine Filters**: Multiple filters work together (AND logic within categories, OR between categories)
4. **Sort Results**: Use the dropdown to change sort order
5. **Clear Filters**: Click "Clear all" or remove individual filter tags

### For Developers

#### Adding New Filters

1. Add the filter type to `FilterState` interface in `ToolsPageContent.tsx`
2. Add filter options to the FilterBar component
3. Add filtering logic to the `filteredAndSortedTools` useMemo
4. Add to ActiveFilters display if needed
5. Add translations in `messages/en.json` and `messages/ja.json`

#### Example: Adding a Language Filter

```typescript
// 1. Add to FilterState
interface FilterState {
  languages: string[];
  // ... existing fields
}

// 2. Add to FilterBar props
interface FilterBarProps {
  languages: string[];
  selectedLanguages: string[];
  // ... existing props
}

// 3. Add filtering logic
if (filters.languages.length > 0) {
  result = result.filter((tool) =>
    filters.languages.some((lang) => 
      tool.languages?.includes(lang)
    )
  );
}
```

## Analytics

Filter and search actions are tracked via Google Analytics:

- `filter_change` event when filters are modified
- Includes filter type and value

## Performance Considerations

- Search is debounced (300ms)
- Filters use useMemo for efficient recalculation
- Large tool collections may benefit from server-side filtering (future enhancement)

## Future Enhancements

Potential improvements for future iterations:

1. **URL Parameters**: Sync filters with URL query parameters for sharing
2. **Saved Filters**: Allow users to save filter combinations
3. **More Platforms**: Expand platform detection logic
4. **Advanced Pricing**: Support price range filters (min/max)
5. **Popularity Metric**: Add explicit popularity tracking
6. **Keyboard Shortcuts**: Quick filter activation via keyboard
