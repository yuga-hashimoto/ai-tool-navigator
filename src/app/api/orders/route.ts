
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = 'mock-user-id';

    let orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mock data if no orders exist, for demonstration
    if (orders.length === 0) {
      // Don't persist this mock data to DB to keep it clean, just return it
      orders = [
        {
          id: 'mock-order-1',
          sessionId: 'mock-session-1',
          userId: 'mock-user-id',
          total: 129.99,
          currency: 'USD',
          status: 'PAID',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          items: [
            {
              id: 'mock-item-1',
              orderId: 'mock-order-1',
              productId: 'prod-1',
              product: {
                id: 'prod-1',
                name: 'Premium AI Tool Subscription',
                slug: 'premium-ai-tool',
                description: 'Monthly subscription',
                price: '29.99',
                currency: 'USD',
                categoryId: null,
                tags: null,
                metadata: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              quantity: 1,
              price: 29.99
            }
          ]
        },
        {
          id: 'mock-order-2',
          sessionId: 'mock-session-2',
          userId: 'mock-user-id',
          total: 49.99,
          currency: 'USD',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
          items: []
        }
      ] as any;
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
