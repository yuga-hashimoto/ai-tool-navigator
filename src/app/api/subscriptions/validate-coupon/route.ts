// POST /api/subscriptions/validate-coupon
// Validate and apply coupon code

import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/subscriptions/subscription-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, tierId } = body;
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Missing coupon code' },
        { status: 400 }
      );
    }
    
    const result = await validateCoupon(code, tierId);
    
    if (!result.valid) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      data: result.coupon,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
