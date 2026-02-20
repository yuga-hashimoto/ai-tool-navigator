import prisma from '@/lib/prisma';

export const MOCK_USER_ID = 'mock-user-id';

export async function ensureMockUser() {
  const user = await prisma.user.findUnique({
    where: { id: MOCK_USER_ID },
    include: { loyaltyAccount: true, subscription: true }
  });

  if (user) return user;

  // Ensure a product exists for the order
  let product = await prisma.product.findFirst();
  if (!product) {
    product = await prisma.product.create({
      data: {
        slug: 'ai-writer-pro',
        name: 'AI Writer Pro',
        description: 'Best AI writing tool',
        price: '49.99',
      }
    });
  }

  // Create mock user
  return await prisma.user.create({
    data: {
      id: MOCK_USER_ID,
      email: 'mock@example.com',
      name: 'Mock User',
      loyaltyAccount: {
        create: {
          points: 500,
          tier: 'SILVER',
          lifetimePoints: 1200,
          joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        }
      },
      subscription: {
        create: {
          planId: 'PRO',
          status: 'ACTIVE',
          startDate: new Date(),
          autoRenew: true
        }
      },
      orders: {
        create: [
          {
            sessionId: 'mock-session',
            total: 49.99,
            status: 'PAID',
            items: {
              create: [
                {
                  productId: product.id,
                  quantity: 1,
                  price: 49.99
                }
              ]
            }
          }
        ]
      }
    },
    include: { loyaltyAccount: true, subscription: true }
  });
}
