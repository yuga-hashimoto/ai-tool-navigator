// GET /api/subscriptions/user
// Get current user's subscription

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, getBillingHistory, getUserInvoices as getInvoices } from '@/lib/subscriptions/subscription-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeInvoices = searchParams.get('includeInvoices') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No subscription found',
      });
    }
    
    const response: Record<string, unknown> = {
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        isTrial: subscription.isTrial,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        tier: {
          id: subscription.tier.id,
          name: subscription.tier.name,
          slug: subscription.tier.slug,
          price: subscription.tier.price,
          features: subscription.tier.features ? JSON.parse(subscription.tier.features) : [],
        },
      },
    };
    
    if (includeHistory) {
      const history = await getBillingHistory(userId);
      (response as any).data.billingHistory = history;
    }
    
    if (includeInvoices) {
      const invoices = await getInvoices(userId);
      (response as any).data.invoices = invoices;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
