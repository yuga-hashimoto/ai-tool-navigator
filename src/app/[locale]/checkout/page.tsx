"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@/lib/analytics';
import { createPurchase } from '@/app/actions/purchase';
import { getUpsells } from '@/app/actions/upsell';
import { UpsellModal } from '@/components/upsell/UpsellModal';
import { UpsellOffer } from '@/types/upsell';
import { ArrowLeft, CreditCard, Lock, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  slug: string;
  quantity: number;
  title?: string;
  price?: string;
  image?: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('Checkout');
  
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'cart' | 'payment' | 'confirmation'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [upsellOffers, setUpsellOffers] = useState<UpsellOffer[]>([]);
  const [currentUpsellIndex, setCurrentUpsellIndex] = useState(0);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string>('');

  // Parse cart from URL
  useEffect(() => {
    const cartParam = searchParams.get('cart');
    if (cartParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(cartParam));
        setCartData(decoded);
      } catch (error) {
        console.error('Failed to parse cart:', error);
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  // Calculate totals
  const subtotal = cartData.reduce((sum, item) => {
    const price = parsePrice(item.price) || 0;
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Call server action to create purchase
    const result = await createPurchase({
      items: cartData.map(item => ({
        slug: item.slug,
        quantity: item.quantity,
        title: item.title,
        price: item.price
      })),
      totalAmount: total,
      currency: 'USD',
      email: formData.email,
      paymentMethod,
    });

    if (result?.success) {
      // Fetch upsells
      const offers = await getUpsells(result.purchaseId || '');
      setPurchaseId(result.purchaseId || '');

      setIsProcessing(false);

      if (offers && offers.length > 0) {
        setUpsellOffers(offers);
        setCurrentUpsellIndex(0);
        setShowUpsellModal(true);
      } else {
        setStep('confirmation');
      }

      sendGAEvent('purchase', {
        value: total,
        currency: 'USD',
        items: cartData.length,
        transaction_id: result.purchaseId
      });
    } else {
      setIsProcessing(false);
      // Handle error (alert for now)
      alert('Payment failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (cartData.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Your cart is empty
        </h1>
        <p className="mt-2 text-zinc-500">
          Add some tools to your cart to proceed with checkout.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'cart' && (
              <button
                onClick={() => setStep('cart')}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {step === 'cart' && 'Review Cart'}
              {step === 'payment' && 'Payment'}
              {step === 'confirmation' && 'Thank You!'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Lock className="w-4 h-4" />
            <span>Secure</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        {step !== 'confirmation' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['cart', 'payment'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === s
                      ? "bg-blue-600 text-white"
                      : ['cart', 'payment'].indexOf(step) > idx
                      ? "bg-green-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                  )}
                >
                  {['cart', 'payment'].indexOf(step) > idx ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 1 && (
                  <div
                    className={cn(
                      "w-16 h-1 mx-2 rounded",
                      ['cart', 'payment'].indexOf(step) > idx
                        ? "bg-green-500"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Order Confirmed!
            </h2>
            <p className="mt-4 text-zinc-500 max-w-md mx-auto">
              Thank you for your purchase. You will receive a confirmation email shortly with access details.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items (Cart Step) */}
              {step === 'cart' && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Cart Items ({cartData.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {cartData.map((item) => (
                      <div key={item.slug} className="p-4 flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title || item.slug}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.title || item.slug}
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.price || 'Free'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                      Payment Method
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'card', icon: CreditCard, label: 'Card' },
                        { id: 'paypal', icon: () => <span className="font-bold text-xl">P</span>, label: 'PayPal' },
                        { id: 'apple', icon: () => <span className="font-bold text-xl">🍎</span>, label: 'Apple Pay' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-colors flex flex-col items-center gap-2",
                            paymentMethod === method.id
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          )}
                        >
                          <method.icon />
                          <span className="text-sm font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Form (simplified) */}
                  {paymentMethod === 'card' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                      <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        Card Details
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="4242 4242 4242 4242"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                              Expiry
                            </label>
                            <input
                              type="text"
                              value={formData.expiry}
                              onChange={(e) => setFormData(prev => ({ ...prev, expiry: e.target.value }))}
                              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={formData.cvv}
                              onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                              className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay ${total.toFixed(2)}</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary (Cart Step Only) */}
            {step === 'cart' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('payment')}
                    className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors"
                  >
                    Proceed to Payment
                  </button>
                </div>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 text-zinc-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">SSL Encrypted</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upsell Modal */}
      {showUpsellModal && upsellOffers.length > 0 && (
        <UpsellModal
          purchaseId={purchaseId}
          offer={upsellOffers[currentUpsellIndex]}
          isOpen={showUpsellModal}
          onClose={() => {
            // Move to next upsell or finish
            if (currentUpsellIndex < upsellOffers.length - 1) {
              setCurrentUpsellIndex(prev => prev + 1);
            } else {
              setShowUpsellModal(false);
              setStep('confirmation');
            }
          }}
          onComplete={() => {
             // Move to next upsell or finish
             if (currentUpsellIndex < upsellOffers.length - 1) {
              setCurrentUpsellIndex(prev => prev + 1);
            } else {
              setShowUpsellModal(false);
              setStep('confirmation');
            }
          }}
        />
      )}
    </div>
  );
}

// Helper function
function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
