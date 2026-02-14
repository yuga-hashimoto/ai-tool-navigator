'use server';

import { getAllTools, ToolMetadata } from '@/lib/tools';
import { getRecommendationsForHistory } from '@/lib/recommendation-engine';

export async function fetchRecommendations(
  viewedSlugs: string[],
  limit: number = 3,
  locale: string = 'en'
): Promise<ToolMetadata[]> {
  const allTools = await getAllTools(locale);

  // Convert viewed slugs to ToolMetadata objects
  const viewedTools = allTools.filter((tool) => viewedSlugs.includes(tool.slug));

  if (viewedTools.length === 0) {
    // Fallback: return top rated if no valid history found
    // We sort a copy to avoid mutating the original array (though unlikely to matter here as unstable_cache returns fresh object usually or cached)
    // But to be safe
    return [...allTools]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  return getRecommendationsForHistory(viewedTools, allTools, limit);
}
