"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useMiniCart } from '@/hooks/useMiniCart';
import { cn } from '@/lib/utils';
import { X, Plus, Minus, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';

export function MiniCart() {
  const {
    miniCartItems,
    miniCartOpen,
    itemCount,
    subtotal,
    openMiniCart,
    closeMiniCart,
    toggleMiniCart,
    removeFromMiniCart,
    updateQuantity,
    clearMiniCart,
    proceedToCheckout,
  } = useMiniCart();

  const cartRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && miniCartOpen) {
        closeMiniCart();
      }
    };

    if (miniCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [miniCartOpen, closeMiniCart]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeMiniCart();
    }
  }, [closeMiniCart]);

  // Cart button
  const CartButton = (
    <button
      onClick={toggleMiniCart}
      className="relative p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-xs font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );

  if (miniCartItems.length === 0) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        {CartButton}
      </div>
    );
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {CartButton}
      </div>

      {/* Cart Panel */}
      {miniCartOpen && (
        <div
          ref={cartRef}
          className="fixed inset-0 z-50"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Your Cart ({itemCount})
                </h2>
              </div>
              <button
                onClick={closeMiniCart}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)]">
              {miniCartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                >
                  {/* Image */}
                  {item.tool.image && (
                    <img
                      src={item.tool.image}
                      alt={item.tool.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {item.tool.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                      {item.tool.category}
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                      {item.tool.price || 'Free'}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromMiniCart(item.id)}
                        className="ml-auto p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </span>
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={proceedToCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    clearMiniCart();
                    closeMiniCart();
                  }}
                  className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 100 && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Add ${(100 - subtotal).toFixed(2)} for free shipping
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
