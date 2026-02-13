// GET /api/subscriptions/tiers
// Get all available subscription tiers

import { NextResponse } from 'next/server';
import { getSubscriptionTiers } from '@/lib/subscriptions/subscription-manager';

export async function GET() {
  try {
    const tiers = await getSubscriptionTiers();
    
    return NextResponse.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription tiers' },
      { status: 500 }
    );
  }
}
