/**
 * Cart API Route
 * 
 * Handles cart operations:
 * - POST: Add item to cart
 * - PUT: Update cart item
 * - DELETE: Remove item from cart
 * - GET: Get cart contents
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory cart storage (use Redis/database in production)
const carts = new Map<string, { items: Array<{ toolSlug: string; quantity: number }>; updatedAt: number }>();

const CART_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value || 'default';

  try {
    const cart = carts.get(sessionId);
    
    if (!cart || Date.now() - cart.updatedAt > CART_TTL) {
      return NextResponse.json({
        items: [],
        itemCount: 0,
        subtotal: 0,
      });
    }

    // In production, fetch actual tool data and calculate totals
    return NextResponse.json({
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: 0, // Calculate from tool data
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    console.error('[Cart API] GET error:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value || `cart_${Date.now()}`;

  try {
    const body = await request.json();
    const { toolSlug, quantity = 1 } = body;

    if (!toolSlug) {
      return NextResponse.json({ error: 'toolSlug is required' }, { status: 400 });
    }

    // Get or create cart
    let cart = carts.get(sessionId);
    if (!cart || Date.now() - cart.updatedAt > CART_TTL) {
      cart = { items: [], updatedAt: Date.now() };
    }

    // Check if item already exists
    const existingIndex = cart.items.findIndex(item => item.toolSlug === toolSlug);
    
    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ toolSlug, quantity });
    }

    // Save cart
    cart.updatedAt = Date.now();
    carts.set(sessionId, cart);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
    
    response.cookies.set('cart_session', sessionId, {
      maxAge: CART_TTL / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Cart API] POST error:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'No cart session' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { toolSlug, quantity } = body;

    if (!toolSlug || quantity === undefined) {
      return NextResponse.json({ error: 'toolSlug and quantity are required' }, { status: 400 });
    }

    const cart = carts.get(sessionId);
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(item => item.toolSlug === toolSlug);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = Date.now();
    carts.set(sessionId, cart);

    return NextResponse.json({
      success: true,
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('[Cart API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'No cart session' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get('toolSlug');

    const cart = carts.get(sessionId);
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (toolSlug) {
      // Remove specific item
      cart.items = cart.items.filter(item => item.toolSlug !== toolSlug);
    } else {
      // Clear entire cart
      cart.items = [];
    }

    cart.updatedAt = Date.now();
    carts.set(sessionId, cart);

    return NextResponse.json({
      success: true,
      items: cart.items,
      itemCount: 0,
    });
  } catch (error) {
    console.error('[Cart API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete cart' }, { status: 500 });
  }
}
