import { ToolMetadata } from './tools';

export function getContentBasedRecommendations(
  currentTool: ToolMetadata,
  allTools: ToolMetadata[],
  limit: number = 3
): ToolMetadata[] {
  // Filter by category
  let candidates = allTools.filter(
    (tool) => tool.category === currentTool.category && tool.slug !== currentTool.slug
  );

  // Sort by rating (descending)
  candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  // Take top limit
  if (candidates.length > limit) {
    candidates = candidates.slice(0, limit);
  }

  return candidates;
}
