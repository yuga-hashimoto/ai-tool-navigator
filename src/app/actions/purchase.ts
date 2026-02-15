'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

interface CartItem {
  slug: string;
  quantity: number;
  title?: string;
  price?: string;
}

interface PurchaseData {
  items: CartItem[];
  totalAmount: number;
  currency: string;
  email: string;
  paymentMethod: string;
}

export async function createPurchase(data: PurchaseData) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id || session?.user?.email; // Fallback to email as ID if ID is missing but email exists, though usually ID is present.
    // Actually, schema has userId as String?. If guest, it's null.

    // Create the purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: userId || null, // If no session, null
        email: data.email,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: 'completed',
        items: {
          create: data.items.map((item) => {
             // Parse price string to float if needed
             const price = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
                : (item.price || 0);

             return {
              productId: item.slug,
              name: item.title || item.slug,
              quantity: item.quantity,
              price: price,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // In a real app, you would also trigger email sending here, or let a background job handle it.
    // For our requirements, we have email sequences 1h, 24h, 72h.
    // We also want an IMMEDIATE upsell. This function returns the purchase object,
    // which the frontend can use to query for upsells.

    revalidatePath('/checkout');

    return { success: true, purchaseId: purchase.id };
  } catch (error) {
    console.error('Failed to create purchase:', error);
    return { success: false, error: 'Failed to create purchase' };
  }
}
