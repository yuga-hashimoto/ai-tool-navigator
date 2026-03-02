"use client";

import { useState, useCallback, useEffect } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { useMiniCart } from '@/hooks/useMiniCart';
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@/lib/analytics';
import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight, CreditCard, Lock, Check, Loader2, Zap } from 'lucide-react';
import Image from 'next/image';

interface MiniCheckoutProps {
  onClose?: () => void;
}

export function MiniCheckout({ onClose }: MiniCheckoutProps) {
  const {
    miniCartItems,
    itemCount,
    subtotal,
    openMiniCart,
    closeMiniCart,
    removeFromMiniCart,
    updateQuantity,
    clearMiniCart,
    proceedToCheckout,
  } = useMiniCart();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'cart' | 'success'>('cart');

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCheckout = useCallback(async () => {
    setIsLoading(true);
    
    // Track checkout initiation
    sendGAEvent('begin_checkout', {
      items: miniCartItems.length,
      value: subtotal,
    });
    
    // Simulate quick checkout process
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
    setStep('success');
    
    sendGAEvent('purchase', {
      items: miniCartItems.length,
      value: subtotal,
    });
  }, [miniCartItems.length, subtotal]);

  // Calculate totals
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (miniCartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ShoppingCart className="w-12 h-12 text-zinc-300 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Your cart is empty
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Add some tools to get started
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Continue shopping
          </button>
        )}
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Order Complete!
        </h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          Thank you for your purchase. Check your email for access details.
        </p>
        <button
          onClick={() => {
            clearMiniCart();
            if (onClose) onClose();
          }}
          className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Quick Cart ({itemCount})
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {miniCartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
          >
            {item.tool.image && (
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.tool.image}
                  alt={item.tool.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate">
                {item.tool.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {item.tool.category}
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
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
                <span className="w-6 text-center text-sm font-medium">
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
        {/* Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Quick Checkout
            </>
          )}
        </button>

        {/* Security */}
        <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secure
          </span>
          <span>•</span>
          <span>SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}
