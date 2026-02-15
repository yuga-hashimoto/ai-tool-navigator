import prisma from '@/lib/prisma';
import { getToolBySlug } from '@/lib/tools';

export interface CartItem {
  toolSlug: string;
  quantity: number;
  toolName?: string;
  price?: number;
  discount?: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  updatedAt: number;
}

const CART_TTL = 24 * 60 * 60 * 1000; // 24 hours

export class CartService {
  /**
   * Get cart by session ID
   */
  static async getCart(sessionId: string): Promise<CartSummary> {
    try {
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        return { items: [], itemCount: 0, subtotal: 0, updatedAt: Date.now() };
      }

      const items = JSON.parse(cart.items) as CartItem[];

      return {
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cart.totalValue,
        updatedAt: cart.updatedAt.getTime(),
      };
    } catch (error) {
      console.error('[CartService] Error fetching cart:', error);
      return { items: [], itemCount: 0, subtotal: 0, updatedAt: Date.now() };
    }
  }

  /**
   * Add item to cart
   * Validates tool existence and ensures non-negative price.
   * TODO: Implement optimistic locking or atomic updates to handle concurrent requests (race conditions).
   */
  static async addToCart(
    sessionId: string,
    item: CartItem,
    options?: {
      visitorEmail?: string;
      userId?: string;
      affiliateId?: string;
      source?: string;
    }
  ): Promise<CartSummary> {
    try {
      // Validate tool existence
      const tool = await getToolBySlug(item.toolSlug);
      if (!tool) {
        throw new Error(`Tool not found: ${item.toolSlug}`);
      }

      // Validate price (non-negative)
      if (item.price !== undefined && item.price < 0) {
        throw new Error('Invalid price');
      }

      const existingCart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      let items: CartItem[] = [];
      if (existingCart) {
        items = JSON.parse(existingCart.items) as CartItem[];
      }

      const existingItemIndex = items.findIndex(i => i.toolSlug === item.toolSlug);

      if (existingItemIndex !== -1) {
        items[existingItemIndex].quantity += item.quantity;
        // Update other fields if provided
        if (item.toolName) items[existingItemIndex].toolName = item.toolName;
        if (item.price !== undefined) items[existingItemIndex].price = item.price;
      } else {
        items.push(item);
      }

      // Recalculate total value
      const totalValue = items.reduce((sum, i) => sum + ((i.price || 0) * i.quantity), 0);

      const cart = await prisma.cart.upsert({
        where: { sessionId },
        create: {
          sessionId,
          items: JSON.stringify(items),
          totalValue,
          visitorEmail: options?.visitorEmail,
          userId: options?.userId,
          affiliateId: options?.affiliateId,
          source: options?.source || 'direct',
          status: 'active',
          lastActiveAt: new Date(),
        },
        update: {
          items: JSON.stringify(items),
          totalValue,
          visitorEmail: options?.visitorEmail || undefined, // Update if provided
          userId: options?.userId || undefined,
          affiliateId: options?.affiliateId || undefined,
          source: options?.source || undefined,
          status: 'active',
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: cart.totalValue,
        updatedAt: cart.updatedAt.getTime(),
      };
    } catch (error) {
      console.error('[CartService] Error adding to cart:', error);
      throw error; // Propagate error to API
    }
  }

  /**
   * Update item quantity
   */
  static async updateItem(sessionId: string, toolSlug: string, quantity: number): Promise<CartSummary> {
    try {
      const cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        throw new Error('Cart not found');
      }

      let items = JSON.parse(cart.items) as CartItem[];
      const itemIndex = items.findIndex(i => i.toolSlug === toolSlug);

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }

      const totalValue = items.reduce((sum, i) => sum + ((i.price || 0) * i.quantity), 0);

      const updatedCart = await prisma.cart.update({
        where: { sessionId },
        data: {
          items: JSON.stringify(items),
          totalValue,
          status: 'active',
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: updatedCart.totalValue,
        updatedAt: updatedCart.updatedAt.getTime(),
      };
    } catch (error) {
      console.error('[CartService] Error updating item:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(sessionId: string, toolSlug: string): Promise<CartSummary> {
    return this.updateItem(sessionId, toolSlug, 0);
  }

  /**
   * Clear cart
   */
  static async clearCart(sessionId: string): Promise<CartSummary> {
    try {
      const updatedCart = await prisma.cart.update({
        where: { sessionId },
        data: {
          items: '[]',
          totalValue: 0,
          status: 'active',
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        items: [],
        itemCount: 0,
        subtotal: 0,
        updatedAt: updatedCart.updatedAt.getTime(),
      };
    } catch (error) {
      console.error('[CartService] Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Save full cart (replace items)
   */
  static async saveCart(
    sessionId: string,
    items: CartItem[],
    options?: {
      visitorEmail?: string;
      userId?: string;
      affiliateId?: string;
      source?: string;
    }
  ): Promise<CartSummary> {
    try {
      // Validate all tools and prices
      for (const item of items) {
        const tool = await getToolBySlug(item.toolSlug);
        if (!tool) {
           throw new Error(`Tool not found: ${item.toolSlug}`);
        }
        if (item.price !== undefined && item.price < 0) {
           throw new Error('Invalid price');
        }
      }

      const totalValue = items.reduce((sum, i) => sum + ((i.price || 0) * i.quantity), 0);

      const cart = await prisma.cart.upsert({
        where: { sessionId },
        create: {
          sessionId,
          items: JSON.stringify(items),
          totalValue,
          visitorEmail: options?.visitorEmail,
          userId: options?.userId,
          affiliateId: options?.affiliateId,
          source: options?.source || 'direct',
          status: 'active',
          lastActiveAt: new Date(),
        },
        update: {
          items: JSON.stringify(items),
          totalValue,
          visitorEmail: options?.visitorEmail || undefined,
          userId: options?.userId || undefined,
          affiliateId: options?.affiliateId || undefined,
          source: options?.source || undefined,
          status: 'active',
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: cart.totalValue,
        updatedAt: cart.updatedAt.getTime(),
      };
    } catch (error) {
      console.error('[CartService] Error saving cart:', error);
      throw error;
    }
  }
}
