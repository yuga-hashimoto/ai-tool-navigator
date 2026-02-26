import prisma from '@/lib/prisma';
import { ToolMetadata, getToolBySlug, Tool } from '@/lib/tools';

const WEIGHTS = {
  VIEW: 1,
  CLICK: 2,
  ADD_TO_CART: 3,
  PURCHASE: 5,
};

type InteractionType = keyof typeof WEIGHTS;

// Helper to fetch recommendations based on a list of product IDs
async function getCollaborativeRecommendations(
  productIds: string[],
  excludeIds: string[],
  limit: number = 3
): Promise<{ productId: string; score: number }[]> {
  if (productIds.length === 0) return [];

  // Find sessions that interacted with ANY of the source products
  // We consider all interaction types to capture "Users who bought X also bought Y" logic
  const sessions = await prisma.userInteraction.findMany({
    where: {
      productId: { in: productIds },
    },
    select: { sessionId: true },
    distinct: ['sessionId'],
    take: 200, // Limit sample size
  });

  const sessionIds = sessions.map((s) => s.sessionId);
  if (sessionIds.length === 0) return [];

  // Find other products these sessions interacted with
  const otherInteractions = await prisma.userInteraction.findMany({
    where: {
      sessionId: { in: sessionIds },
      productId: { notIn: excludeIds }, // Exclude source products and already recommended
    },
    select: {
      productId: true,
      type: true,
    },
  });

  // Calculate scores
  const scores = new Map<string, number>();
  for (const interaction of otherInteractions) {
    const type = interaction.type as InteractionType;
    const weight = WEIGHTS[type] || 1;
    const currentScore = scores.get(interaction.productId) || 0;
    scores.set(interaction.productId, currentScore + weight);
  }

  // Sort by score
  return Array.from(scores.entries())
    .map(([productId, score]) => ({ productId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Content-Based Filtering using Tag Similarity (Jaccard Index)
async function getContentBasedRecommendations(
  sourceProducts: { id: string; tags: string[]; categoryId: string | null }[],
  excludeIds: string[],
  limit: number = 3
): Promise<{ productId: string; score: number }[]> {
  if (sourceProducts.length === 0) return [];

  // Get candidate products (same category or global if no category)
  // Optimization: Filter by category of the first source product to limit search space
  const categoryIds = sourceProducts
    .map(p => p.categoryId)
    .filter((id): id is string => id !== null);

  const candidates = await prisma.product.findMany({
    where: {
      id: { notIn: excludeIds },
      ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
    },
    select: { id: true, tags: true },
  });

  const scores = candidates.map(candidate => {
    let maxSimilarity = 0;
    let candidateTags: string[] = [];
    try {
      candidateTags = JSON.parse(candidate.tags || '[]');
    } catch (e) {
        candidateTags = [];
    }

    for (const source of sourceProducts) {
      const similarity = calculateJaccardSimilarity(source.tags, candidateTags);
      if (similarity > maxSimilarity) maxSimilarity = similarity;
    }
    return { productId: candidate.id, score: maxSimilarity };
  });

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function calculateJaccardSimilarity(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0;
  const set1 = new Set(tags1);
  const set2 = new Set(tags2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}


// Main function for Product Page
export async function getRecommendations(
  sessionId: string,
  currentSlug: string,
  limit: number = 3,
  locale: string = 'en',
  fetcher: (slug: string, locale?: string) => Promise<Tool | null> = getToolBySlug
): Promise<ToolMetadata[]> {

  const currentProduct = await prisma.product.findUnique({
    where: { slug: currentSlug },
  });

  if (!currentProduct) return [];

  // 1. Collaborative
  let recs = await getCollaborativeRecommendations([currentProduct.id], [currentProduct.id], limit);

  // 2. Content-Based Fallback
  if (recs.length < limit) {
    let currentTags: string[] = [];
    try {
        currentTags = JSON.parse(currentProduct.tags || '[]');
    } catch (e) {}

    const contentRecs = await getContentBasedRecommendations(
      [{ id: currentProduct.id, tags: currentTags, categoryId: currentProduct.categoryId }],
      [currentProduct.id, ...recs.map(r => r.productId)],
      limit - recs.length
    );
    recs = [...recs, ...contentRecs];
  }

  // 3. Category Fallback (if tags fail)
  if (recs.length < limit && currentProduct.categoryId) {
    const excludeIds = [currentProduct.id, ...recs.map(r => r.productId)];
    const categoryRecs = await prisma.product.findMany({
        where: {
            categoryId: currentProduct.categoryId,
            id: { notIn: excludeIds }
        },
        take: limit - recs.length
    });
    categoryRecs.forEach(p => recs.push({ productId: p.id, score: 0 }));
  }

  return fetchToolsForProducts(recs.map(r => r.productId), locale, fetcher);
}

// New function for Cart/Checkout
export async function getCartRecommendations(
  slugs: string[],
  limit: number = 3,
  locale: string = 'en',
  fetcher: (slug: string, locale?: string) => Promise<Tool | null> = getToolBySlug
): Promise<ToolMetadata[]> {
    if (slugs.length === 0) return [];

    const products = await prisma.product.findMany({
        where: { slug: { in: slugs } }
    });

    if (products.length === 0) return [];
    const productIds = products.map(p => p.id);

    // 1. Collaborative
    let recs = await getCollaborativeRecommendations(productIds, productIds, limit);

    // 2. Content-Based Fallback
    if (recs.length < limit) {
        const sourceProducts = products.map(p => {
            let tags: string[] = [];
            try { tags = JSON.parse(p.tags || '[]'); } catch(e) {}
            return { id: p.id, tags, categoryId: p.categoryId };
        });

        const contentRecs = await getContentBasedRecommendations(
            sourceProducts,
            [...productIds, ...recs.map(r => r.productId)],
            limit - recs.length
        );
        recs = [...recs, ...contentRecs];
    }

    // 3. Simple Fallback: Random Popular (or just random from same categories)
    if (recs.length < limit) {
        const excludeIds = [...productIds, ...recs.map(r => r.productId)];

        // Fetch random products to fill the gap
        const randomProducts = await prisma.product.findMany({
            where: { id: { notIn: excludeIds } },
            take: limit - recs.length,
            orderBy: { createdAt: 'desc' } // Just take newest for now, or use a popularity metric if available
        });

        randomProducts.forEach(p => recs.push({ productId: p.id, score: 0 }));
    }

    return fetchToolsForProducts(recs.map(r => r.productId), locale, fetcher);
}

async function fetchToolsForProducts(
    productIds: string[],
    locale: string,
    fetcher: (slug: string, locale?: string) => Promise<Tool | null>
): Promise<ToolMetadata[]> {
    if (productIds.length === 0) return [];

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    const toolPromises = productIds.map(async (id) => {
        const product = productMap.get(id);
        if (product) {
            return await fetcher(product.slug, locale);
        }
        return null;
    });

    const results = await Promise.all(toolPromises);
    return results.filter((tool): tool is Tool => tool !== null).map(t => t.metadata);
}
