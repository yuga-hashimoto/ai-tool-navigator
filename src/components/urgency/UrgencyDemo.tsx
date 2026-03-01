'use client';

import React from 'react';
import { CountdownTimer, StockIndicator, FomoBadge, UrgencyBanner, UrgencyPricing } from './index';
// useConversionTracking hook temporarily disabled
// import { useConversionTracking } from '@/hooks/useCountdown';

export function UrgencyDemo() {
  // const { trackPageView, trackCtaClick, trackPurchase } = useConversionTracking();
  
  const expirationDate = new Date(Date.now() + 86400000 * 2);
  const productExpiration = new Date(Date.now() + 3600000);
  
  const handlePurchase = () => {
    // trackPurchase(99.99);
    console.log('Purchase completed!');
  };
  
  const handleTierSelect = (tierId: string) => {
    // trackCtaClick('high');
    console.log('Selected tier:', tierId);
  };
  
  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Urgency Elements Demo</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Countdown Timer Variants</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Default (Dark Theme)</h3>
            <CountdownTimer expirationDate={expirationDate} variant="default" showProgress theme="dark" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Compact</h3>
            <CountdownTimer expirationDate={expirationDate} variant="compact" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Badge Style</h3>
            <CountdownTimer expirationDate={expirationDate} variant="badge" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Minimal</h3>
            <CountdownTimer expirationDate={expirationDate} variant="minimal" className="text-2xl font-mono" />
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stock Indicators</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">High Urgency Stock</h3>
            <StockIndicator productId="demo-1" initialStock={10} maxStock={100} variant="default" showDynamicDiscount />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Low Urgency Stock</h3>
            <StockIndicator productId="demo-2" initialStock={75} maxStock={100} variant="default" />
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">FOMO Badges</h2>
        <div className="flex flex-wrap gap-2">
          <FomoBadge urgencyLevel="critical" variant="pulse" />
          <FomoBadge urgencyLevel="high" variant="glow" />
          <FomoBadge urgencyLevel="medium" />
          <FomoBadge urgencyLevel="low" />
          <FomoBadge urgencyLevel="high" variant="outline" />
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Urgency Banner</h2>
        <UrgencyBanner urgencyLevel="high" title="Flash Sale! 50% Off" subtitle="Limited time offer - Don't miss out!" cta={{ text: 'Shop Now', onClick: handlePurchase }} />
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dynamic Pricing</h2>
        <UrgencyPricing
          tiers={[
            { id: 'basic', name: 'Basic', basePrice: 9.99, features: ['Feature 1', 'Feature 2'] },
            { id: 'pro', name: 'Pro', basePrice: 19.99, features: ['Feature 1', 'Feature 2', 'Feature 3'], popular: true },
            { id: 'enterprise', name: 'Enterprise', basePrice: 49.99, features: ['All features', 'Priority support'] }
          ]}
          urgencyLevel="high"
          expirationDate={productExpiration}
          onTierSelect={handleTierSelect}
        />
      </section>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Complete Product Card Example</h2>
        <div className="border rounded-xl p-6 max-w-md">
          <div className="flex justify-between items-start mb-4">
            <FomoBadge urgencyLevel="high" variant="pulse" />
            <span className="text-sm text-gray-500">AI Tool</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Premium AI Assistant</h3>
          <p className="text-gray-600 mb-4">Advanced AI-powered tool for productivity and automation.</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold">$49.99</span>
            <span className="text-gray-500 line-through">$99.99</span>
            <span className="text-sm text-green-600 font-medium">-50%</span>
          </div>
          <div className="mb-4">
            <CountdownTimer expirationDate={productExpiration} variant="compact" className="text-sm" />
          </div>
          <StockIndicator productId="product-demo" initialStock={8} maxStock={100} variant="progress" className="mb-4" />
          <button onClick={handlePurchase} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
            Buy Now - Save $50!
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">🔥 47 people are viewing this • 12 purchased today</p>
        </div>
      </section>
    </div>
  );
}
