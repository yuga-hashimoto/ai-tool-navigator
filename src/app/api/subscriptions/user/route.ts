// GET /api/subscriptions/user
// Get current user's subscription

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, getBillingHistory, getInvoices } from '@/lib/subscriptions/subscription-manager';

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
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        tier: (subscription as any).tier ? {
          id: (subscription as any).tier.id,
          name: (subscription as any).tier.name,
          slug: (subscription as any).tier.slug,
          price: (subscription as any).tier.price,
          features: (subscription as any).tier.features ? JSON.parse((subscription as any).tier.features) : [],
        } : null,
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
