/**
 * Dynamic Pricing Demo Page
 * 
 * Demonstrates all dynamic pricing and urgency incentive components
 */

'use client';

import { useState } from 'react';
import { 
  Clock, 
  Tag, 
  Flame, 
  Star, 
  ShoppingCart, 
  Check, 
  TrendingUp,
  Lock
} from 'lucide-react';
import UrgencyCountdown from '@/lib/dynamic-pricing/UrgencyCountdown';
import PricingTierBadge, { StockRemaining, SavingsDisplay } from '@/lib/dynamic-pricing/PricingTierBadge';
import UrgencyBundleCard, { BundleList } from '@/lib/dynamic-pricing/UrgencyBundleCard';
import CheckoutCountdown from '@/lib/dynamic-pricing/CheckoutCountdown';
import { 
  TIME_SENSITIVE_TIERS, 
  URGENCY_BUNDLES,
  getActiveTimeSensitiveTiers,
  getPopularBundles,
  trackConversionFunnel 
} from '@/lib/dynamic-pricing/dynamicPricing';

export default function DynamicPricingDemo() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'bundles' | 'checkout' | 'components'>('tiers');
  const [cart, setCart] = useState<string[]>([]);

  const handleAddToCart = (bundleId: string) => {
    setCart(prev => [...prev, bundleId]);
    trackConversionFunnel(bundleId, 'add_to_cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dynamic Pricing & Urgency Incentives
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Time-sensitive offers designed to drive 20-30% higher conversions
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { id: 'tiers', label: 'Time-Sensitive Tiers', icon: <Clock className="w-4 h-4" /> },
              { id: 'bundles', label: 'Urgency Bundles', icon: <Tag className="w-4 h-4" /> },
              { id: 'checkout', label: 'Checkout Countdown', icon: <Lock className="w-4 h-4" /> },
              { id: 'components', label: 'Components', icon: <Star className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tiers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Active Time-Sensitive Offers
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {getActiveTimeSensitiveTiers().map(tier => (
                <div 
                  key={tier.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Badge */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b">
                    <PricingTierBadge tier={tier} size="lg" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{tier.description}</p>

                    {/* Pricing */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-3xl font-bold text-green-600">
                        ${tier.currentPrice}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        ${tier.originalPrice}
                      </span>
                      <SavingsDisplay
                        originalPrice={tier.originalPrice}
                        salePrice={tier.currentPrice}
                        size="sm"
                      />
                    </div>

                    {/* Countdown */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Offer ends in:</p>
                      <UrgencyCountdown 
                        endDate={tier.endDate} 
                        variant="full"
                        size="md"
                      />
                    </div>

                    {/* Stock */}
                    {tier.maxPurchases && (
                      <StockRemaining
                        current={tier.currentPurchases}
                        max={tier.maxPurchases}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* CTA */}
                  <div className="p-4 bg-gray-50 border-t">
                    <button
                      onClick={() => handleAddToCart(tier.id)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Claim This Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bundles' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bundle & Save
              </h2>
              <p className="text-gray-600">
                Curated bundles with exclusive savings and urgency pricing
              </p>
            </div>

            <BundleList
              bundles={URGENCY_BUNDLES}
              columns={2}
              featuredOnly={false}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Checkout Timer Demo
            </h2>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Complete your purchase to lock in:
              </h3>
              
              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Pro Power Pack</span>
                  <span className="font-semibold">$129.99</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span>Early Bird Discount</span>
                  <span>-$30.00</span>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>$99.99</span>
                </div>
              </div>

              {/* Checkout countdown */}
              <CheckoutCountdown
                variant="standard"
                size="lg"
                showProgressBar={true}
                autoStart={true}
                onExpire={() => console.log('Timer expired!')}
                onExtend={() => console.log('Extended!')}
              />
            </div>

            {/* Inline countdown demo */}
            <div className="bg-white rounded-xl shadow p-4">
              <h4 className="font-medium text-gray-900 mb-2">Inline Variant</h4>
              <CheckoutCountdown
                variant="inline"
                size="md"
                showProgressBar={true}
              />
            </div>

            {/* Compact countdown demo */}
            <div className="mt-4 bg-white rounded-xl shadow p-4">
              <h4 className="font-medium text-gray-900 mb-2">Compact Variant</h4>
              <CheckoutCountdown
                variant="compact"
                size="lg"
              />
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Component Showcase
            </h2>

            {/* Countdown Variants */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                UrgencyCountdown Variants
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Standard</p>
                  <UrgencyCountdown
                    endDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                    variant="standard"
                    size="md"
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Compact</p>
                  <UrgencyCountdown
                    endDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                    variant="compact"
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Full</p>
                  <UrgencyCountdown
                    endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                    variant="full"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Badge Variants */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                PricingTierBadge Variants
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {TIME_SENSITIVE_TIERS.slice(0, 4).map((tier, idx) => (
                  <PricingTierBadge
                    key={idx}
                    tier={tier}
                    size="lg"
                    animated={true}
                  />
                ))}
              </div>
            </div>

            {/* Savings Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                SavingsDisplay
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <SavingsDisplay
                    originalPrice={99.99}
                    salePrice={69.99}
                    size="lg"
                    showPercent={true}
                    showAmount={true}
                  />
                </div>
                
                <div className="p-4 bg-blue-50 rounded-xl">
                  <SavingsDisplay
                    originalPrice={199.99}
                    salePrice={149.99}
                    size="md"
                    showPercent={true}
                    showAmount={true}
                  />
                </div>
                
                <div className="p-4 bg-purple-50 rounded-xl">
                  <SavingsDisplay
                    originalPrice={49.99}
                    salePrice={39.99}
                    size="sm"
                    showPercent={true}
                    showAmount={true}
                  />
                </div>
              </div>
            </div>

            {/* Stock Remaining */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                StockRemaining
              </h3>
              
              <div className="space-y-4 max-w-md">
                <StockRemaining
                  current={5}
                  max={100}
                  size="md"
                />
                
                <StockRemaining
                  current={15}
                  max={100}
                  size="md"
                />
                
                <StockRemaining
                  current={45}
                  max={100}
                  size="md"
                />
                
                <StockRemaining
                  current={90}
                  max={100}
                  size="md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cart indicator */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</span>
          </div>
        )}
      </div>
    </div>
  );
}
