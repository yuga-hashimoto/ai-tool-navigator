import prisma from '@/lib/prisma';
import { ToolMetadata, getToolBySlug, Tool } from '@/lib/tools';

export async function getRecommendations(
  sessionId: string,
  currentSlug: string,
  limit: number = 3,
  locale: string = 'en',
  fetcher: (slug: string, locale?: string) => Promise<Tool | null> = getToolBySlug
): Promise<ToolMetadata[]> {
  // 1. Collaborative Filtering: "Users who viewed this also viewed..."
  // Find sessions that viewed the current product
  // We need the product ID first
  const currentProduct = await prisma.product.findUnique({
    where: { slug: currentSlug },
  });

  if (!currentProduct) {
    // If product not in DB, fallback to empty array (caller can handle fallback)
    return [];
  }

  // Find sessions that interacted with this product
  const sessions = await prisma.userInteraction.findMany({
    where: {
      productId: currentProduct.id,
      type: 'VIEW', // Focus on views for now
    },
    select: { sessionId: true },
    distinct: ['sessionId'],
    take: 100, // Limit sample size for performance
  });

  const sessionIds = sessions.map((s) => s.sessionId);

  let recommendedProductIds: { productId: string; count: number }[] = [];

  if (sessionIds.length > 0) {
    // Find other products viewed by these sessions
    const otherInteractions = await prisma.userInteraction.groupBy({
      by: ['productId'],
      where: {
        sessionId: { in: sessionIds },
        productId: { not: currentProduct.id },
        type: 'VIEW',
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: limit,
    });

    recommendedProductIds = otherInteractions.map(i => ({
        productId: i.productId,
        count: i._count.productId
    }));
  }

  // 2. Content-Based Filtering (Fallback)
  // If we don't have enough collaborative recommendations, fill with same category
  if (recommendedProductIds.length < limit) {
    const categoryId = currentProduct.categoryId;
    if (categoryId) {
        const excludeIds = [currentProduct.id, ...recommendedProductIds.map(i => i.productId)];

        const contentBased = await prisma.product.findMany({
            where: {
                categoryId: categoryId,
                id: { notIn: excludeIds }
            },
            take: limit - recommendedProductIds.length
        });

        contentBased.forEach(p => {
            recommendedProductIds.push({ productId: p.id, count: 0 });
        });
    }
  }

  // Fetch full product details
  const productIds = recommendedProductIds.map(i => i.productId);
  if (productIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // Convert to ToolMetadata
  // We can trust the DB metadata or fetch from markdown.
  // Fetching from markdown ensures consistency with other parts of the app.
  const tools: ToolMetadata[] = [];

  for (const product of products) {
      const tool = await fetcher(product.slug, locale);
      if (tool) {
          tools.push(tool.metadata);
      }
  }

  // Sort by the order in recommendedProductIds (which is by popularity)
  // Create a map for quick lookup of order
  const orderMap = new Map(productIds.map((id, index) => [id, index]));

  // We need to map back from slug to ID to sort correctly, but we only have slugs in tools.
  // Actually we have products list with slugs and IDs.
  const slugToId = new Map(products.map(p => [p.slug, p.id]));

  tools.sort((a, b) => {
      const idA = slugToId.get(a.slug);
      const idB = slugToId.get(b.slug);
      const indexA = idA ? orderMap.get(idA) ?? 999 : 999;
      const indexB = idB ? orderMap.get(idB) ?? 999 : 999;
      return indexA - indexB;
  });

  return tools;
}
