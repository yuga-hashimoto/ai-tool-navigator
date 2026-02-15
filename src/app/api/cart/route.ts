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
import { CartService } from '@/lib/cart-service';
import crypto from 'crypto';

const CART_TTL = 24 * 60 * 60; // 24 hours in seconds

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value;

  if (!sessionId) {
     return NextResponse.json({
        items: [],
        itemCount: 0,
        subtotal: 0,
        updatedAt: Date.now()
      });
  }

  try {
    const cart = await CartService.getCart(sessionId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error('[Cart API] GET error:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('cart_session')?.value || `cart_${crypto.randomUUID()}`;

  try {
    const body = await request.json();
    const { toolSlug, quantity = 1, toolName, price } = body;

    if (!toolSlug) {
      return NextResponse.json({ error: 'toolSlug is required' }, { status: 400 });
    }

    const cart = await CartService.addToCart(sessionId, { toolSlug, quantity, toolName, price });

    const response = NextResponse.json({
      success: true,
      ...cart
    });
    
    // Refresh cookie
    response.cookies.set('cart_session', sessionId, {
      maxAge: CART_TTL,
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

    const cart = await CartService.updateItem(sessionId, toolSlug, quantity);

    return NextResponse.json({
      success: true,
      ...cart
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

    let cart;
    if (toolSlug) {
      cart = await CartService.removeItem(sessionId, toolSlug);
    } else {
      cart = await CartService.clearCart(sessionId);
    }

    return NextResponse.json({
      success: true,
      ...cart
    });
  } catch (error) {
    console.error('[Cart API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete cart' }, { status: 500 });
  }
}
