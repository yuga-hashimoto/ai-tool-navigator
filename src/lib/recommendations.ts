import prisma from '@/lib/prisma';
import { Product } from '@prisma/client';

export interface RecommendationOptions {
  limit?: number;
  userId?: string;
  sessionId?: string;
}

export async function getContentBasedRecommendations(
  slug: string,
  options: RecommendationOptions = {}
): Promise<Product[]> {
  const limit = options.limit || 3;

  // 1. Fetch current product
  const currentProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (!currentProduct) {
    return [];
  }

  // 2. Find products in same category
  // Enhance with tag matching or vector search later
  const recommendations = await prisma.product.findMany({
    where: {
      category: currentProduct.category,
      slug: { not: slug }, // Exclude current product
    },
    take: limit,
    // Add randomness or sort by rating/popularity if needed
    orderBy: {
      rating: 'desc', // Simple heuristic: recommend highest rated in same category
    },
  });

  return recommendations;
}
