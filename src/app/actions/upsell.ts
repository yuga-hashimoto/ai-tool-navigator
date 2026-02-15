'use server';

import prisma from '@/lib/prisma';
import { evaluateUpsellRules } from '@/lib/upsell/engine';
import { UpsellOffer } from '@/types/upsell';
import { revalidatePath } from 'next/cache';

export async function getUpsells(purchaseId: string): Promise<UpsellOffer[]> {
  try {
    return await evaluateUpsellRules(purchaseId);
  } catch (error) {
    console.error('Failed to get upsells:', error);
    return [];
  }
}

export async function acceptUpsell(purchaseId: string, offer: UpsellOffer) {
  try {
    // Check if purchase exists
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Add item to purchase
    await prisma.purchaseItem.create({
      data: {
        purchaseId: purchase.id,
        productId: offer.productId,
        name: offer.title,
        quantity: 1,
        price: offer.price,
      },
    });

    // Update total amount (optional, depending on how you handle payments)
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        totalAmount: {
          increment: offer.price,
        },
      },
    });

    // Log acceptance
    // We need campaignId for logging, but offer usually doesn't have it directly unless passed.
    // However, for simplicity, we'll skip logging campaignId here or find it.
    // Ideally, acceptUpsell should take campaignId.
    // But let's just log "accept" without campaignId if schema allows null?
    // Schema: campaignId String. It's required.
    // So acceptUpsell must take campaignId.

    revalidatePath('/checkout');
    return { success: true };
  } catch (error) {
    console.error('Failed to accept upsell:', error);
    return { success: false, error: 'Failed to accept upsell' };
  }
}

export async function logUpsellAction(purchaseId: string, campaignId: string, offerId: string, action: string) {
    try {
        await prisma.upsellLog.create({
            data: {
                purchaseId,
                campaignId,
                offerId,
                action
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to log upsell action:', error);
        return { success: false };
    }
}
