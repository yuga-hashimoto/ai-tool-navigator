"use client";

import { useState, useEffect, useCallback } from "react";

interface CartItem {
  toolSlug: string;
  toolName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartAbandonmentAlertProps {
  items: CartItem[];
  sessionId: string;
  visitorEmail?: string;
  affiliateId?: string;
  discountCode?: string;
  onClose?: () => void;
  onCheckout?: () => void;
}

export function CartAbandonmentAlert({
  items,
  sessionId,
  visitorEmail,
  affiliateId,
  discountCode,
  onClose,
  onCheckout,
}: CartAbandonmentAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState(visitorEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const totalValue = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Show alert when user shows intent to leave
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isSaved) {
        setIsVisible(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isSaved]);

  const handleSaveCart = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/abandonment/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          items,
          visitorEmail: email || visitorEmail,
          affiliateId,
          source: "cart_alert",
        }),
      });

      if (response.ok) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to save cart:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, items, email, visitorEmail, affiliateId]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  // Don't show if already saved
  if (isSaved) return null;

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 w-80 animate-slide-up">
      <div className="bg-white rounded-t-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 p-3 flex items-center justify-between">
          <div className="flex items-center text-white">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-semibold">Wait! Don't lose your cart</span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-orange-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Cart summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              You have <strong>{itemCount}</strong> item{itemCount !== 1 ? "s" : ""} in your cart
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 truncate max-w-40">
                    {item.toolName}
                  </span>
                  <span className="text-gray-500">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Email capture */}
          {!visitorEmail && (
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Save your cart:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          {/* Discount offer */}
          {discountCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4 text-center">
              <p className="text-sm text-green-700">
                Use code{" "}
                <span className="font-mono font-bold">{discountCode}</span> for
                10% off!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveCart}
              disabled={isSubmitting || (!visitorEmail && !email)}
              className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Cart"}
            </button>
            <button
              onClick={() => {
                handleClose();
                onCheckout?.();
              }}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CartAbandonmentAlert;
