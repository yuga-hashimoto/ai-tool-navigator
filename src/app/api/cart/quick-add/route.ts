/**
 * Quick Add to Cart API Route
 * 
 * POST /api/cart/quick-add
 * - Fast AJAX endpoint for adding items to cart
 * - Returns minimal response for quick performance
 */

import { NextRequest, NextResponse } from 'next/server';

interface AddToCartRequest {
  toolSlug: string;
  quantity?: number;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddToCartRequest = await request.json();
    
    const { toolSlug, quantity = 1, source = 'quick_add' } = body;

    // Validate input
    if (!toolSlug) {
      return NextResponse.json(
        { error: 'toolSlug is required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Validate tool exists and is available
    // 2. Check inventory
    // 3. Apply any promotions
    // 4. Add to cart in database/session

    // Simulate minimal processing for speed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate cart item ID
    const cartItemId = `${toolSlug}-${Date.now()}`;

    // Return minimal success response
    return NextResponse.json({
      success: true,
      cartItemId,
      toolSlug,
      quantity,
      message: 'Added to cart',
      // Include cart summary for UI update
      cartSummary: {
        itemCount: quantity,
        // In production, calculate actual total
        subtotal: 0,
      },
    }, {
      headers: {
        // Short cache for dynamic content
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('[Quick Add API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

/**
 * Batch Quick Add API Route
 * 
 * POST /api/cart/quick-add/batch
 * - Add multiple items to cart at once
 */

export async function PUT(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 }
      );
    }

    // Limit batch size
    const limitedItems = items.slice(0, 10);

    // Process all items
    const results = limitedItems.map((item: AddToCartRequest) => ({
      toolSlug: item.toolSlug,
      quantity: item.quantity || 1,
      success: true,
    }));

    // In production, add all items to cart atomically

    return NextResponse.json({
      success: true,
      added: results.length,
      items: results,
      cartSummary: {
        itemCount: results.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        subtotal: 0,
      },
    });
  } catch (error) {
    console.error('[Batch Add API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add items to cart' },
      { status: 500 }
    );
  }
}
