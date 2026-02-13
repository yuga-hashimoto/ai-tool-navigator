/**
 * Cart Abandonment API Route
 * 
 * POST /api/abandonment/cart
 * - Stores abandoned cart data
 * - Processes cart recovery
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  storeAbandonedCart, 
  getAbandonedCart, 
  generateCartRecoveryUrl 
} from "@/lib/abandoned-link-recovery";

interface CartItem {
  toolSlug: string;
  toolName: string;
  price: number;
  quantity: number;
  discount?: number;
}

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
    
    // Store abandoned cart
    const cart = await storeAbandonedCart(
      sessionId,
      items,
      visitorEmail,
      affiliateId,
      source
    );
    
    if (!cart) {
      return NextResponse.json(
        { error: "Failed to store cart" },
        { status: 500 }
      );
    }
    
    // Generate recovery URL
    const recoveryUrl = generateCartRecoveryUrl(sessionId, items);
    
    return NextResponse.json({
      success: true,
      cartId: cart.sessionId,
      totalValue: cart.totalValue,
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
    
    const cart = await getAbandonedCart(sessionId);
    
    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: cart,
    });
    
  } catch (error) {
    console.error("[Cart Abandonment API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
