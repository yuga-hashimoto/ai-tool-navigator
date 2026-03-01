import { getAllTools, ToolMetadata } from './tools';

const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  'Video Generation': ['Audio Generation', 'Text-to-Speech', 'Writing', 'Marketing'],
  'Writing': ['SEO', 'Marketing', 'Automation'],
  'Coding': ['LLM', 'Productivity', 'Automation'],
  'LLM': ['Coding', 'Writing', 'Search'],
  'Marketing': ['Writing', 'Video Generation', 'Automation'],
  'Automation': ['Marketing', 'Writing', 'Coding'],
  'Real Estate': ['Marketing', 'Video Generation'],
  'Search': ['LLM', 'Research'],
  'Security': ['Coding', 'Automation'],
  'Text-to-Speech': ['Video Generation', 'Writing'],
  'Website Builder': ['Marketing', 'Design', 'Writing'],
  'Design': ['Website Builder', 'Marketing'],
  'Productivity': ['Coding', 'Writing'],
  'Audio Generation': ['Video Generation', 'Text-to-Speech'],
  'SEO': ['Writing', 'Marketing'],
  'Business Automation': ['Marketing', 'Writing', 'Coding'],
  'AI Coworker': ['Automation', 'Coding', 'Writing'],
  'Coding Agent': ['Coding', 'LLM'],
  'Coding Assistant': ['Coding', 'LLM'],
  'Comparison': ['Search'],
  'AI Comparisons': ['Search'],
};

export async function getRecommendations(
  currentTool: ToolMetadata,
  limit: number = 3,
  locale: string = 'en',
  visitorId?: string
): Promise<ToolMetadata[]> {
  // 1. Fetch all tools
  const allTools = await getAllTools(locale);

  // 2. Filter out current tool
  const candidates = allTools.filter(t => t.slug !== currentTool.slug);

  // 3. Behavioral / Collaborative Filtering
  // Look up user interaction data (views, clicks, etc.)
  const collaborativeScores: Record<string, number> = {};

  if (visitorId) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Get tools the user has interacted with
      const userInteractions = await prisma.userInteraction.findMany({
        where: { visitorId },
        select: { toolSlug: true, type: true }
      });

      // Calculate scores based on interaction types
      // Provide higher weights for clicks/conversions than mere views
      userInteractions.forEach(interaction => {
        const slug = interaction.toolSlug;
        if (!collaborativeScores[slug]) collaborativeScores[slug] = 0;

        switch (interaction.type) {
          case 'CONVERSION':
          case 'PURCHASE':
             collaborativeScores[slug] += 10;
             break;
          case 'CLICK':
             collaborativeScores[slug] += 5;
             break;
          case 'VIEW':
          default:
             collaborativeScores[slug] += 1;
             break;
        }
      });
    } catch (e) {
      // Ignore prisma errors (e.g. if db is not reachable during build)
      console.error("Failed to fetch user interactions for recommendations", e);
    }
  }

  // 4. Content-Based Scoring
  const scoredCandidates = candidates.map(tool => {
    let score = 0;

    // Add collaborative score if available
    if (collaborativeScores[tool.slug]) {
        score += collaborativeScores[tool.slug];
    }

    // Same category: +5 (Strong signal for alternatives)
    if (tool.category === currentTool.category) {
      score += 5;
    }

    // Complementary category: +3 (Cross-sell)
    const complementary = COMPLEMENTARY_CATEGORIES[currentTool.category] || [];
    if (complementary.includes(tool.category)) {
      score += 3;
    }

    // Rating: +Rating (0-10 usually)
    if (tool.rating) {
      score += tool.rating;
    }

    // Featured/Promoted: +2
    if (tool.featured || tool.promoted) {
      score += 2;
    }

    // Tool of the week: +3
    if (tool.tool_of_the_week) {
        score += 3;
    }

    // Verified: +1
    if (tool.verified) {
      score += 1;
    }

    return { tool, score };
  });

  // 5. Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates.slice(0, limit).map(item => item.tool);
}
