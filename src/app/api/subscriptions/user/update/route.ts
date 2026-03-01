// Subscription User API
// Handles creation and updates of user subscriptions

import { NextRequest, NextResponse } from 'next/server';
import {
  createUserSubscription,
  changeSubscriptionTier,
  cancelSubscriptionByManager as cancelSubscription,
  reactivateSubscriptionByManager as reactivateSubscription,
  previewTierChange,
  getUserSubscription
} from '@/lib/subscriptions/subscription-manager';

// POST /api/subscriptions/user
// Create new subscription or start trial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, tierId, isTrial, trialDays } = body;
    
    if (!userId || !email || !tierId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, email, tierId' },
        { status: 400 }
      );
    }
    
    const subscription = await createUserSubscription({
      userId,
      email,
      tierId,
      isTrial: isTrial ?? false,
      trialDays,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        isTrial: subscription.isTrial,
        trialEndsAt: subscription.trialEndsAt,
        tier: subscription.tier.name,
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// PATCH /api/subscriptions/user
// Update subscription (upgrade/downgrade/cancel)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, subscriptionId, newTierId, cancelAtPeriodEnd, previewOnly } = body;
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, action' },
        { status: 400 }
      );
    }
    
    // Get user's subscription
    const currentSub = await getUserSubscription(userId);
    
    if (!currentSub) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    const subId = subscriptionId || currentSub.id;
    
    switch (action) {
      case 'upgrade':
      case 'downgrade': {
        if (!newTierId) {
          return NextResponse.json(
            { success: false, error: 'Missing newTierId for upgrade/downgrade' },
            { status: 400 }
          );
        }
        
        if (previewOnly) {
          const preview = await previewTierChange(subId, newTierId);
          return NextResponse.json({
            success: true,
            data: preview,
          });
        }
        
        const updated = await changeSubscriptionTier(subId, newTierId);
        return NextResponse.json({
          success: true,
          data: {
            status: updated.status,
            tier: updated.tier.name,
          },
        });
      }
      
      case 'cancel': {
        const canceled = await cancelSubscription(subId, cancelAtPeriodEnd ?? true);
        return NextResponse.json({
          success: true,
          data: {
            status: canceled.status,
            cancelAtPeriodEnd: canceled.cancelAtPeriodEnd,
          },
        });
      }
      
      case 'reactivate': {
        const reactivated = await reactivateSubscription(subId);
        return NextResponse.json({
          success: true,
          data: {
            status: reactivated.status,
            cancelAtPeriodEnd: reactivated.cancelAtPeriodEnd,
          },
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
