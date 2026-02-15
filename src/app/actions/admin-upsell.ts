'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface CampaignData {
  name: string;
  triggerRules: string;
  offers: string;
  isActive: boolean;
}

export async function createCampaign(data: CampaignData) {
  try {
    await prisma.upsellCampaign.create({
      data: {
        name: data.name,
        triggerRules: data.triggerRules,
        offers: data.offers,
        isActive: data.isActive,
      },
    });
    revalidatePath('/admin/upsells');
    return { success: true };
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return { success: false, error: 'Failed to create campaign' };
  }
}

export async function getCampaigns() {
    try {
        const campaigns = await prisma.upsellCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                logs: true
            }
        });
        return campaigns;
    } catch (error) {
        console.error('Failed to get campaigns:', error);
        return [];
    }
}
