import prisma from '@/lib/prisma';

export async function logSearch(query: string, resultsCount: number, sessionId?: string) {
  try {
    await prisma.searchLog.create({
      data: {
        query,
        resultsCount,
        sessionId,
      },
    });
  } catch (error) {
    console.error('Error logging search:', error);
  }
}
