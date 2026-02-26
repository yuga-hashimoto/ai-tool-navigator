import { PrismaClient } from '@prisma/client';
import { getRecommendations, getCartRecommendations } from '../src/lib/recommendations';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up test data...');
  // Note: In a real env be careful. This is a test script.
  // We will use specific slugs to avoid messing with real data.
  const slugs = ['test-prod-a', 'test-prod-b', 'test-prod-c', 'test-prod-d'];

  await prisma.userInteraction.deleteMany({
    where: { productId: { in: (await prisma.product.findMany({ where: { slug: { in: slugs } } })).map(p => p.id) } }
  });
  await prisma.product.deleteMany({ where: { slug: { in: slugs } } });

  console.log('Creating products...');
  const category = await prisma.category.upsert({
    where: { slug: 'test-category' },
    update: {},
    create: { name: 'Test Category', slug: 'test-category' }
  });

  const products = await Promise.all(slugs.map(slug =>
    prisma.product.create({
      data: {
        slug,
        name: slug,
        categoryId: category.id,
        tags: JSON.stringify(['test-tag']),
      }
    })
  ));

  const [prodA, prodB, prodC, prodD] = products;

  console.log('Creating interactions...');
  // User 1: View A, View B
  const s1 = 'session-1';
  await Promise.all([
      prisma.userInteraction.create({ data: { sessionId: s1, productId: prodA.id, type: 'VIEW' } }),
      prisma.userInteraction.create({ data: { sessionId: s1, productId: prodB.id, type: 'VIEW' } })
  ]);

  // User 2: View A, View B
  const s2 = 'session-2';
  await Promise.all([
      prisma.userInteraction.create({ data: { sessionId: s2, productId: prodA.id, type: 'VIEW' } }),
      prisma.userInteraction.create({ data: { sessionId: s2, productId: prodB.id, type: 'VIEW' } })
  ]);

  // User 3: View A, View C
  const s3 = 'session-3';
  await Promise.all([
      prisma.userInteraction.create({ data: { sessionId: s3, productId: prodA.id, type: 'VIEW' } }),
      prisma.userInteraction.create({ data: { sessionId: s3, productId: prodC.id, type: 'VIEW' } })
  ]);

  // User 4: Buy A, Buy D (Purchase weight = 5)
  const s4 = 'session-4';
  await Promise.all([
      prisma.userInteraction.create({ data: { sessionId: s4, productId: prodA.id, type: 'PURCHASE' } }),
      prisma.userInteraction.create({ data: { sessionId: s4, productId: prodD.id, type: 'PURCHASE' } })
  ]);

  console.log('Testing getRecommendations(A)...');
  // Dummy fetcher
  const mockFetcher = async (slug: string) => ({ metadata: { slug, title: slug }, content: '' } as any);

  const recsA = await getRecommendations('session-new', prodA.slug, 3, 'en', mockFetcher);
  console.log('Recommendations for A:', recsA.map(r => r.slug));

  // Expectations:
  // D: shared via session-4 (Purchase) -> Score 5
  // B: shared via session-1, session-2 (View) -> Score 1+1=2
  // C: shared via session-3 (View) -> Score 1
  // Expected order: D, B, C (test-prod-d, test-prod-b, test-prod-c)

  const slugsA = recsA.map(r => r.slug);
  if (slugsA[0] === 'test-prod-d' && slugsA[1] === 'test-prod-b') {
    console.log('✅ getRecommendations logic verified (Weighted interactions working).');
  } else {
    console.error('❌ getRecommendations logic failed. Expected D, B, C. Got:', slugsA);
  }

  console.log('Testing getCartRecommendations([A])...');
  const recsCart = await getCartRecommendations([prodA.slug], 3, 'en', mockFetcher);
  console.log('Cart Recommendations for [A]:', recsCart.map(r => r.slug));

  const slugsCart = recsCart.map(r => r.slug);
  if (slugsCart[0] === 'test-prod-d') {
      console.log('✅ getCartRecommendations logic verified.');
  } else {
      console.error('❌ getCartRecommendations logic failed.');
  }

  // Content based test
  console.log('Testing Content-Based Fallback...');
  // Create Prod E with same tags as A, but no interactions
  const prodE = await prisma.product.create({
      data: { slug: 'test-prod-e', name: 'E', categoryId: category.id, tags: JSON.stringify(['test-tag']) }
  });

  // Create Prod F with different tags
  const prodF = await prisma.product.create({
      data: { slug: 'test-prod-f', name: 'F', categoryId: category.id, tags: JSON.stringify(['other-tag']) }
  });

  // If we limit to higher number, we should see E appear before F (due to tags) or category fallback
  const recsFallback = await getRecommendations('session-new', prodA.slug, 10, 'en', mockFetcher);
  const slugsFallback = recsFallback.map(r => r.slug);
  console.log('Fallback Recs:', slugsFallback);

  if (slugsFallback.includes('test-prod-e')) {
       console.log('✅ Content-based fallback verified (E found).');
  }

  // Cleanup
  console.log('Cleanup...');
  await prisma.userInteraction.deleteMany({
    where: { productId: { in: [...products.map(p => p.id), prodE.id, prodF.id] } }
  });
  await prisma.product.deleteMany({ where: { slug: { in: [...slugs, 'test-prod-e', 'test-prod-f'] } } });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
