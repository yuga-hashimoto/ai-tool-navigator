# Recently Viewed Tools Implementation

This document describes the implementation of the Recently Viewed Tools feature for tracking and displaying tools that users have recently viewed.

## Overview

The Recently Viewed Tools feature helps increase user engagement and improve UX for returning users by:
- Tracking tools users view in real-time
- Storing data in localStorage with automatic expiration (30 days)
- Displaying recently viewed tools in a sidebar component
- Sorting by recency and category

## Files Created

### 1. `src/hooks/useRecentlyViewed.ts`

The main hook for tracking and managing recently viewed tools.

#### Features:
- **Automatic localStorage persistence**: Data survives page refreshes
- **Expiration handling**: Automatically removes entries older than 30 days
- **Max items limit**: Stores up to 10 most recent tools
- **CRUD operations**: Add, remove, and clear tools

#### Usage:

```tsx
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

function MyComponent() {
  const { recentTools, addTool, removeTool, clearAll, isLoading } = useRecentlyViewed();
  
  // Add a tool when user views it
  const handleToolView = (tool) => {
    addTool(tool);
  };
  
  // Render the list
  return (
    <div>
      {recentTools.map(tool => (
        <div key={tool.slug}>{tool.title}</div>
      ))}
    </div>
  );
}
```

#### API Reference:

| Function | Description |
|----------|-------------|
| `recentTools` | Array of recently viewed tools |
| `addTool(tool: ToolMetadata)` | Add a tool to the recent list |
| `removeTool(slug: string)` | Remove a specific tool |
| `clearAll()` | Clear all recent tools |
| `isLoading` | Boolean indicating if data is loading |

### 2. `src/components/RecentToolsSidebar.tsx`

A sidebar component to display recently viewed tools.

#### Features:
- Responsive design with dark mode support
- Skeleton loading state
- Empty state with helpful message
- Compact mode for tight spaces
- Individual tool removal
- Time-ago formatting (e.g., "5m ago", "2h ago")

#### Usage:

```tsx
// Full sidebar
import { RecentToolsSidebar } from '@/components/RecentToolsSidebar';

<RecentToolsSidebar 
  maxItems={5}
  showCategory={true}
  compact={false}
/>

// Compact widget for sidebar integration
import { RecentToolsWidget } from '@/components/RecentToolsSidebar';

<RecentToolsWidget />
```

#### Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxItems` | number | 5 | Maximum number of tools to display |
| `showCategory` | boolean | true | Show category badge |
| `compact` | boolean | false | Use compact layout |
| `className` | string | - | Additional CSS classes |

### 3. Tracking Tool Views in Tool Detail Pages

Use the `useTrackToolView` hook in tool detail pages:

```tsx
import { useTrackToolView } from '@/hooks/useRecentlyViewed';
import { getToolBySlug } from '@/lib/tools';

export default function ToolPage({ tool }) {
  // Automatically tracks when tool is loaded
  useTrackToolView(tool);
  
  return <ToolContent tool={tool} />;
}
```

### 4. Translation Strings

Added to `messages/en.json` and `messages/ja.json`:

```json
{
  "RecentToolsSidebar": {
    "title": "Recently Viewed",
    "viewAll": "View All",
    "clear": "Clear",
    "clearAll": "Clear all recent tools",
    "remove": "Remove",
    "justNow": "Just now",
    "minutesAgo": "{count}m ago",
    "hoursAgo": "{count}h ago",
    "daysAgo": "{count}d ago",
    "emptyTitle": "No recent tools yet",
    "emptyDescription": "Tools you view will appear here for quick access"
  }
}
```

## Integration Examples

### Adding to Main Layout

```tsx
// src/app/[locale]/layout.tsx
import { RecentToolsSidebar } from '@/components/RecentToolsSidebar';

export default function Layout({ children, params }) {
  return (
    <div className="container mx-auto flex gap-8">
      <main className="flex-1">{children}</main>
      <aside className="w-80">
        <RecentToolsSidebar />
      </aside>
    </div>
  );
}
```

### Adding to Tools Page

```tsx
// src/app/[locale]/tools/page.tsx
import { RecentToolsSidebar } from '@/components/RecentToolsSidebar';

export default function ToolsPage() {
  return (
    <div className="container mx-auto flex gap-8">
      <div className="flex-1">
        <ToolsPageContent />
      </div>
      <div className="w-80 space-y-6">
        <RecentToolsSidebar maxItems={4} />
      </div>
    </div>
  );
}
```

### Manual Tracking in Custom Components

```tsx
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ToolMetadata } from '@/lib/tools';

function ToolCard({ tool }) {
  const { addTool } = useRecentlyViewed();
  
  const handleClick = () => {
    // Track when user clicks to view tool details
    addTool(tool);
    // Navigate to tool page...
  };
  
  return <button onClick={handleClick}>{tool.title}</button>;
}
```

## Data Structure

```typescript
interface RecentlyViewedTool {
  slug: string;           // Tool identifier
  title: string;          // Tool name
  category: string;       // Tool category
  image?: string;         // Tool image URL
  rating: number;        // Tool rating (0-5)
  viewedAt: number;      // Unix timestamp
}
```

## Storage Details

- **Key**: `recently_viewed_tools`
- **Format**: JSON array of `RecentlyViewedTool` objects
- **Max Items**: 10
- **Expiration**: 30 days (automatically cleaned)
- **Client-side only**: Uses localStorage (not sent to server)

## Best Practices

1. **Use `useTrackToolView`** in tool detail pages for automatic tracking
2. **Use `RecentToolsWidget`** for compact spaces (sidebar footers, mobile)
3. **Use `RecentToolsSidebar`** for dedicated sidebar sections
4. **Always handle empty state** - first-time visitors see a helpful message
5. **Don't overtrack** - only track when user intentionally views a tool

## Performance Considerations

- Minimal re-renders using `useCallback`
- LocalStorage operations are fast
- Automatic cleanup prevents storage bloat
- Skeleton loading prevents layout shift

## Future Enhancements

Potential improvements:
- Sync with server for cross-device support
- Add category filters to sidebar
- Include quick action buttons (compare, bookmark)
- Add analytics tracking for feature usage
- Implement "similar tools" suggestions based on history
