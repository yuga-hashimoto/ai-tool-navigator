'use server';

import prisma from '@/lib/prisma';
import { allocateOrder } from '@/lib/fulfillment';
import { revalidatePath } from 'next/cache';

interface OrderItemInput {
  slug: string;
  quantity: number;
  price: number;
}

interface OrderData {
  sessionId: string;
  userId?: string;
  items: OrderItemInput[];
  total: number;
  currency?: string;
}

export async function submitOrder(data: OrderData) {
  try {
    // Resolve slugs to product IDs
    const productMap = new Map<string, string>(); // slug -> id

    for (const item of data.items) {
        const product = await prisma.product.findUnique({
            where: { slug: item.slug },
            select: { id: true }
        });
        if (!product) {
            return { success: false, error: `Product not found: ${item.slug}` };
        }
        productMap.set(item.slug, product.id);
    }

    const allocationItems = data.items.map(item => ({
        productId: productMap.get(item.slug)!,
        quantity: item.quantity
    }));

    // 1. Validate inventory and get allocation plan
    const allocationResult = await allocateOrder(allocationItems);

    if (!allocationResult.success) {
      return { success: false, error: allocationResult.errors?.join(', ') || 'Inventory allocation failed' };
    }

    // 2. Create Order and OrderItems transactionally
    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
          total: data.total,
          currency: data.currency || 'USD',
          status: 'PAID',
          items: {
            create: data.items.map(item => ({
              productId: productMap.get(item.slug)!,
              quantity: item.quantity,
              price: item.price,
              orderType: allocationResult.orderType,
            }))
          }
        }
      });

      // Update Inventory based on allocation
      for (const alloc of allocationResult.allocations) {
        await tx.inventory.update({
          where: {
            productId_warehouseId: {
              productId: alloc.productId,
              warehouseId: alloc.warehouseId
            }
          },
          data: {
            quantity: { decrement: alloc.quantity }
          }
        });
      }

      return newOrder;
    });

    // Update global cache
    for (const item of allocationItems) {
        await updateProductInventoryCache(item.productId);
    }

    try {
      revalidatePath('/admin/orders');
      revalidatePath('/admin/inventory');
    } catch (e) {
      // ignore
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('Submit order failed:', error);
    return { success: false, error: 'Failed to submit order' };
  }
}

async function updateProductInventoryCache(productId: string) {
  const total = await prisma.inventory.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: { inventoryCount: total._sum.quantity || 0 },
  });
}
