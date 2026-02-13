// GET /api/subscriptions/checkout
// Create checkout session for subscription

import { NextRequest, NextResponse } from 'next/server';
import { generateCheckoutUrl } from '@/lib/subscriptions/subscription-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, tierId, billingCycle, couponCode } = body;
    
    if (!userId || !email || !tierId || !billingCycle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const checkoutUrl = await generateCheckoutUrl({
      userId,
      email,
      tierId,
      billingCycle,
      successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
      couponCode,
    });
    
    return NextResponse.json({
      success: true,
      data: { checkoutUrl },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
