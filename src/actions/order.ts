'use server';

import prisma from '@/lib/prisma';
import { createAllocationPlan } from '@/lib/fulfillment';
import { revalidatePath } from 'next/cache';

interface CartItem {
  slug: string;
  quantity: number;
  title?: string;
  price?: string;
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    // Ignore revalidation error in non-request context
  }
}

export async function createOrder(data: {
  cart: CartItem[];
  paymentDetails: any;
  userId?: string;
  sessionId: string;
}) {
  try {
    // 1. Resolve product slugs to IDs and Prices
    const slugs = data.cart.map(i => i.slug);
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } }
    });

    const productMap = new Map(products.map(p => [p.slug, p]));

    // Prepare items for allocation
    const allocationItems = [];

    for (const item of data.cart) {
      const product = productMap.get(item.slug);
      if (!product) {
         throw new Error(`Product not found: ${item.slug}`);
      }
      allocationItems.push({
        productId: product.id,
        quantity: item.quantity
      });
    }

    // 2. Create Allocation Plan
    const allocationPlans = await createAllocationPlan(allocationItems);

    // 3. Execute Transaction
    const order = await prisma.$transaction(async (tx) => {
       let subtotal = 0;

       const orderItemsData = [];

       for (const plan of allocationPlans) {
           const product = products.find(p => p.id === plan.productId)!;
           // Parse price
           const priceString = product.price || "0";
           const price = parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;

           subtotal += price * plan.quantity;

           orderItemsData.push({
               productId: plan.productId,
               quantity: plan.quantity,
               price: price,
               warehouseId: plan.warehouseId
           });

           // Decrement Inventory
           const inv = await tx.inventory.findUnique({
               where: {
                   warehouseId_productId: {
                       warehouseId: plan.warehouseId,
                       productId: plan.productId
                   }
               }
           });

           if (!inv) {
               // Create negative inventory (backorder)
               await tx.inventory.create({
                   data: {
                       warehouseId: plan.warehouseId,
                       productId: plan.productId,
                       quantity: -plan.quantity
                   }
               });
           } else {
               await tx.inventory.update({
                   where: { id: inv.id },
                   data: { quantity: { decrement: plan.quantity } }
               });
           }
       }

       const tax = subtotal * 0.1;
       const total = subtotal + tax;

       // Create Order
       const newOrder = await tx.order.create({
           data: {
               sessionId: data.sessionId,
               userId: data.userId,
               total: total,
               currency: "USD",
               status: "PAID",
               items: {
                   create: orderItemsData
               }
           }
       });

       return newOrder;
    });

    safeRevalidatePath('/admin/inventory');

    return { success: true, orderId: order.id };

  } catch (error) {
    console.error("Order creation failed:", error);
    return { success: false, error: (error as Error).message };
  }
}
