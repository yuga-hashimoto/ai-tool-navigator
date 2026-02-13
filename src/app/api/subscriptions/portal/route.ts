// POST /api/subscriptions/portal
// Create customer portal session

import { NextRequest, NextResponse } from 'next/server';
import { generatePortalUrl } from '@/lib/subscriptions/subscription-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const portalUrl = await generatePortalUrl(userId, `${baseUrl}/account`);
    
    return NextResponse.json({
      success: true,
      data: { portalUrl },
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
