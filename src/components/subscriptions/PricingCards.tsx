// Subscription Tiers/Pricing Component
// Displays subscription plans with pricing and features

'use client';

import { useState } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Tier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  priceYearly: number | null;
  features: string | null;
  isPopular: boolean;
  trialDays: number;
  subscriptionPlans?: Array<{
    id: string;
    billingCycle: string;
    price: number;
    stripePriceId: string | null;
    discountPercent: number | null;
  }>;
}

interface PricingCardsProps {
  tiers: Tier[];
  currentTierId?: string;
  userId?: string;
  isAuthenticated?: boolean;
  onSelectTier?: (tier: Tier, billingCycle: 'monthly' | 'yearly') => void;
}

export default function PricingCards({
  tiers,
  currentTierId,
  userId,
  isAuthenticated = false,
  onSelectTier,
}: PricingCardsProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);

  const handleSelectTier = async (tier: Tier) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=/pricing&tier=${tier.slug}`);
      return;
    }

    if (!userId) {
      // Need to get user ID from session
      router.push('/account?setup=true');
      return;
    }

    if (onSelectTier) {
      onSelectTier(tier, billingCycle);
      return;
    }

    // Default: redirect to checkout
    setLoading(tier.id);
    
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tierId: tier.id,
          billingCycle,
          couponCode: validatedCoupon?.code,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setCouponError(data.error || 'Failed to start checkout');
      }
    } catch (error) {
      setCouponError('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const response = await fetch('/api/subscriptions/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();
      
      if (data.success) {
        setValidatedCoupon(data.data);
        setCouponError('');
      } else {
        setValidatedCoupon(null);
        setCouponError(data.error || 'Invalid coupon');
      }
    } catch (error) {
      setCouponError('Failed to validate coupon');
    }
  };

  const getPrice = (tier: Tier) => {
    if (billingCycle === 'yearly' && tier.priceYearly) {
      return tier.priceYearly;
    }
    return tier.price;
  };

  const getDiscountedPrice = (tier: Tier) => {
    const price = getPrice(tier);
    if (!validatedCoupon) return price;
    
    if (validatedCoupon.discountType === 'percent') {
      return price * (1 - validatedCoupon.discountValue / 100);
    }
    return Math.max(0, price - validatedCoupon.discountValue);
  };

  const getFeatures = (featuresJson: string | null): string[] => {
    if (!featuresJson) return [];
    try {
      return JSON.parse(featuresJson) as string[];
    } catch {
      return [];
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 text-green-600 text-xs font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Coupon Input */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={validateCoupon}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Apply
          </button>
        </div>
        {couponError && (
          <p className="text-red-500 text-sm mt-2">{couponError}</p>
        )}
        {validatedCoupon && (
          <p className="text-green-600 text-sm mt-2">
            Coupon applied: {validatedCoupon.discountType === 'percent' 
              ? `${validatedCoupon.discountValue}% off` 
              : `$${validatedCoupon.discountValue} off`}
          </p>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const isCurrentTier = currentTierId === tier.id;
          const price = getDiscountedPrice(tier);
          const originalPrice = getPrice(tier);
          const features = getFeatures(tier.features);

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border transition-all duration-200 ${
                tier.isPopular
                  ? 'border-blue-500 shadow-xl shadow-blue-100'
                  : 'border-gray-200 shadow-lg'
              } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentTier && (
                <div className="absolute -top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Tier Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                
                {/* Description */}
                {tier.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {tier.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  {billingCycle === 'yearly' && originalPrice !== price && (
                    <span className="text-gray-400 line-through ml-2 text-lg">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Trial Badge */}
                {tier.trialDays > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm font-medium">
                      {tier.trialDays}-day free trial
                    </p>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectTier(tier)}
                  disabled={isCurrentTier || loading === tier.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentTier
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : tier.isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {loading === tier.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : isCurrentTier ? (
                    'Current Plan'
                  ) : tier.trialDays > 0 ? (
                    `Start ${tier.trialDays}-Day Free Trial`
                  ) : (
                    'Get Started'
                  )}
                </button>

                {/* Features List */}
                <ul className="mt-6 space-y-3">
                  {(features as string[]).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Money Back Guarantee */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          🔒 30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </div>
  );
}
