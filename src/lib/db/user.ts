import prisma from '@/lib/prisma';

export const MOCK_USER_ID = 'mock-user-id';

export async function ensureMockUser() {
  const user = await prisma.user.findUnique({
    where: { id: MOCK_USER_ID },
    include: { loyalty: true },
  });

  if (!user) {
    // Create mock user
    const newUser = await prisma.user.create({
      data: {
        id: MOCK_USER_ID,
        email: 'mock@example.com',
        name: 'Demo User',
        loyalty: {
          create: {
            points: 500,
            lifetimePoints: 500,
            tier: 'BRONZE',
          },
        },
      },
      include: { loyalty: true },
    });
    return newUser;
  }

  if (!user.loyalty) {
    // Create loyalty account if missing
    // We need to use update to connect or create because user already exists
    const updatedUser = await prisma.user.update({
      where: { id: MOCK_USER_ID },
      data: {
        loyalty: {
          create: {
            points: 0,
            tier: 'BRONZE',
          },
        },
      },
      include: { loyalty: true },
    });
    return updatedUser;
  }

  return user;
}
