
import prisma from '@/lib/prisma';
import { Purchase, PurchaseItem, UpsellCampaign } from '@prisma/client';
import { UpsellOffer, UpsellTriggerRules } from '@/types/upsell';

export async function evaluateUpsellRules(purchaseId: string): Promise<UpsellOffer[]> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { items: true },
  });

  if (!purchase) {
    return [];
  }

  // Fetch active campaigns
  const campaigns = await prisma.upsellCampaign.findMany({
    where: { isActive: true },
  });

  const validOffers: UpsellOffer[] = [];

  for (const campaign of campaigns) {
    let rules: UpsellTriggerRules = {};
    try {
      rules = JSON.parse(campaign.triggerRules);
    } catch (e) {
      console.error(`Failed to parse trigger rules for campaign ${campaign.id}`, e);
      continue;
    }

    if (isCampaignApplicable(purchase, rules)) {
      try {
        const offers = JSON.parse(campaign.offers) as UpsellOffer[];
        // Filter out offers that might already be purchased or not applicable
        // For simplicity, we just add them all for now
        validOffers.push(...offers);

        // Log the view (impression)
        for (const offer of offers) {
            await prisma.upsellLog.create({
                data: {
                    purchaseId: purchase.id,
                    campaignId: campaign.id,
                    offerId: offer.id,
                    action: 'view'
                }
            });
        }

      } catch (e) {
        console.error(`Failed to parse offers for campaign ${campaign.id}`, e);
      }
    }
  }

  return validOffers;
}

function isCampaignApplicable(purchase: Purchase & { items: PurchaseItem[] }, rules: UpsellTriggerRules): boolean {
  // Check min amount
  if (rules.minAmount && purchase.totalAmount < rules.minAmount) {
    return false;
  }

  // Check required products
  if (rules.products && rules.products.length > 0) {
    const hasProduct = purchase.items.some(item => rules.products?.includes(item.productId));
    if (!hasProduct) {
      return false;
    }
  }

  // Check excluded products (if user already bought the upsell item, maybe we shouldn't show it?
  // But usually excludeProducts refers to the *trigger* condition.
  // Let's assume it means "if user bought X, don't show this campaign")
  if (rules.excludeProducts && rules.excludeProducts.length > 0) {
    const hasExcluded = purchase.items.some(item => rules.excludeProducts?.includes(item.productId));
    if (hasExcluded) {
      return false;
    }
  }

  return true;
}
