import { ToolMetadata } from './tools';

const WEIGHTS = {
  CATEGORY: 0.4,
  TEXT_SIMILARITY: 0.5,
  PRICING: 0.1,
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where',
  'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'can', 'just', 'should', 'now', 'use', 'using',
  'used', 'user', 'tool', 'tools', 'app', 'apps', 'software', 'platform'
]);

function preprocessText(text: string): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  );
}

function calculateJaccardIndex(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 && set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function calculateSimilarityScore(toolA: ToolMetadata, toolB: ToolMetadata): number {
  // 1. Category Match (Binary or partial if we had subcategories)
  const categoryScore = toolA.category === toolB.category ? 1 : 0;

  // 2. Text Similarity (Title, Description, Pros, Cons)
  const textA = [
    toolA.title,
    toolA.description,
    ...(toolA.pros || []),
    ...(toolA.cons || [])
  ].join(' ');

  const textB = [
    toolB.title,
    toolB.description,
    ...(toolB.pros || []),
    ...(toolB.cons || [])
  ].join(' ');

  const setA = preprocessText(textA);
  const setB = preprocessText(textB);
  const textScore = calculateJaccardIndex(setA, setB);

  // 3. Pricing Model Match
  // Assuming pricing is one of 'free', 'freemium', 'paid', 'contact'
  let pricingScore = 0;
  if (toolA.pricing && toolB.pricing) {
      if (toolA.pricing === toolB.pricing) {
          pricingScore = 1;
      } else if (
          (toolA.pricing === 'freemium' && toolB.pricing === 'free') ||
          (toolA.pricing === 'free' && toolB.pricing === 'freemium') ||
          (toolA.pricing === 'freemium' && toolB.pricing === 'paid') ||
          (toolA.pricing === 'paid' && toolB.pricing === 'freemium')
      ) {
          // Partial match for adjacent pricing models
          pricingScore = 0.5;
      }
  }

  // Weighted Sum
  return (
    (categoryScore * WEIGHTS.CATEGORY) +
    (textScore * WEIGHTS.TEXT_SIMILARITY) +
    (pricingScore * WEIGHTS.PRICING)
  );
}

export function getRelatedToolsAI(
  currentTool: ToolMetadata,
  allTools: ToolMetadata[],
  limit: number = 3
): ToolMetadata[] {
  const candidates = allTools.filter((tool) => tool.slug !== currentTool.slug);

  const scoredCandidates = candidates.map((tool) => ({
    tool,
    score: calculateSimilarityScore(currentTool, tool),
  }));

  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates.slice(0, limit).map((item) => item.tool);
}

export function getRecommendationsForHistory(
  viewedTools: ToolMetadata[],
  allTools: ToolMetadata[],
  limit: number = 3
): ToolMetadata[] {
  if (viewedTools.length === 0) {
      // If no history, return top rated tools or random selection as fallback
      // For now, let's just return top rated
      return allTools
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, limit);
  }

  const viewedSlugs = new Set(viewedTools.map((t) => t.slug));
  const candidates = allTools.filter((tool) => !viewedSlugs.has(tool.slug));

  const scores = new Map<string, number>();

  for (const candidate of candidates) {
    let maxSimilarity = 0;
    let totalSimilarity = 0;

    for (const viewed of viewedTools) {
      const similarity = calculateSimilarityScore(viewed, candidate);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
      totalSimilarity += similarity;
    }

    // Score could be max similarity (nearest neighbor) or average similarity
    // Let's use a blend: 70% max similarity, 30% average similarity to reward tools similar to multiple viewed items
    const avgSimilarity = totalSimilarity / viewedTools.length;
    const finalScore = (maxSimilarity * 0.7) + (avgSimilarity * 0.3);

    scores.set(candidate.slug, finalScore);
  }

  candidates.sort((a, b) => (scores.get(b.slug) || 0) - (scores.get(a.slug) || 0));

  return candidates.slice(0, limit);
}
