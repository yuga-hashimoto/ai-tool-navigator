/**
 * Cart Abandonment API Route
 * 
 * POST /api/abandonment/cart
 * - Stores abandoned cart data
 * - Processes cart recovery
 */

import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/lib/cart-service";
import { generateCartRecoveryUrl } from "@/lib/abandoned-link-recovery";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { sessionId, items, visitorEmail, affiliateId, source } = body;
    
    // Validate required fields
    if (!sessionId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing sessionId or items" },
        { status: 400 }
      );
    }
    
    // Store abandoned cart using CartService
    const cart = await CartService.saveCart(sessionId, items, {
      visitorEmail,
      affiliateId,
      source
    });
    
    // Generate recovery URL
    const recoveryUrl = generateCartRecoveryUrl(sessionId, items);
    
    return NextResponse.json({
      success: true,
      cartId: sessionId,
      totalValue: cart.subtotal,
      recoveryUrl,
    });
    
  } catch (error) {
    console.error("[Cart Abandonment API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId parameter" },
        { status: 400 }
      );
    }
    
    const cart = await CartService.getCart(sessionId);
    
    if (cart.itemCount === 0) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
          ...cart,
          sessionId,
          currency: 'USD',
          // Legacy format compatibility if needed, but CartSummary structure is clean
          items: JSON.stringify(cart.items)
      },
    });
    
  } catch (error) {
    console.error("[Cart Abandonment API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
