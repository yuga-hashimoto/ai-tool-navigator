import { getContentBasedRecommendations } from '../src/lib/recommendations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
});

async function main() {
  console.log('Testing recommendations...');

  // Find a product in a category with multiple items
  const products = await prisma.product.findMany({
      select: { slug: true, category: true, title: true }
  });

  const counts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const bestCategory = Object.keys(counts).find(c => counts[c] > 1);

  if (!bestCategory) {
      console.log('No category with > 1 product found.');
      return;
  }

  const product = products.find(p => p.category === bestCategory);

  console.log(`Testing with product: ${product.title} (${product.slug}) in category '${bestCategory}'`);

  const recommendations = await getContentBasedRecommendations(product.slug, { limit: 3 });

  if (recommendations.length === 0) {
    console.log('No recommendations found (unexpected).');
  } else {
    console.log(`Found ${recommendations.length} recommendations:`);
    recommendations.forEach(r => {
      console.log(`- ${r.title} (${r.category}, Rating: ${r.rating})`);
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
