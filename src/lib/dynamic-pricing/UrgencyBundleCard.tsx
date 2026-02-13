'use client';

import { useState } from 'react';
import { Check, Clock, Flame, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react';
import UrgencyCountdown from './UrgencyCountdown';
import { StockRemaining } from './PricingTierBadge';
import { UrgencyBundle } from './dynamicPricing';

interface UrgencyBundleCardProps {
  bundle: UrgencyBundle;
  variant?: 'standard' | 'compact' | 'featured';
  onAddToCart?: (bundleId: string) => void;
  className?: string;
}

export default function UrgencyBundleCard({ bundle, variant = 'standard', onAddToCart, className = '' }: UrgencyBundleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isFeatured = variant === 'featured';

  const urgencyConfig = {
    bundle_discount: { icon: <TrendingUp className="w-5 h-5" />, color: 'blue' },
    limited_time: { icon: <Clock className="w-5 h-5" />, color: 'orange' },
    low_stock: { icon: <Flame className="w-5 h-5" />, color: 'red' },
    price_increase_coming: { icon: <AlertTriangle className="w-5 h-5" />, color: 'yellow' }
  };

  const urgency = urgencyConfig[bundle.urgencyType];

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`p-1 rounded ${isFeatured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{urgency.icon}</span>
              <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{bundle.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {bundle.items.slice(0, 2).map((item, idx) => (
                <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.name}</span>
              ))}
              {bundle.items.length > 2 && <span className="text-xs text-gray-500">+{bundle.items.length - 2} more</span>}
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-400 line-through">${bundle.originalTotal.toFixed(2)}</span>
              <span className="text-xl font-bold text-green-600">${bundle.bundlePrice.toFixed(2)}</span>
            </div>
            <span className="text-xs text-green-600 font-medium">Save {bundle.savingsPercent}%</span>
          </div>
        </div>
        <button onClick={() => onAddToCart?.(bundle.id)} className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="w-4 h-4" />Add to Cart
        </button>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-2xl overflow-hidden ${isFeatured ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'shadow-lg'} hover:shadow-xl transition-all duration-300 ${isFeatured ? 'transform hover:scale-110' : 'transform hover:-translate-y-1'} ${className}`}>
      {isFeatured && <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold z-10">⭐ BEST VALUE - {bundle.savingsPercent}% OFF</div>}
      {bundle.popular && !isFeatured && <div className="absolute top-3 right-3 z-10"><span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" />POPULAR</span></div>}
      {bundle.bestValue && !isFeatured && <div className="absolute top-3 left-3 z-10"><span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">BEST VALUE</span></div>}

      <div className={`p-6 ${isFeatured ? 'pt-14' : ''} bg-gradient-to-br from-gray-50 to-white`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`p-1.5 rounded-lg ${isFeatured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{urgency.icon}</span>
          <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{bundle.description}</p>
        <div className="flex items-center gap-2 mb-4"><span className={`text-sm font-medium ${isFeatured ? 'text-blue-600' : 'text-orange-600'}`}>{bundle.urgencyMessage}</span></div>
        {bundle.countdownEnd && <div className="mb-4"><UrgencyCountdown endDate={bundle.countdownEnd} variant="compact" size="sm" /></div>}
        {bundle.stockRemaining !== undefined && <div className="mb-4"><StockRemaining current={bundle.stockRemaining} max={bundle.maxStock || 50} size="sm" /></div>}

        <div className="space-y-2 mb-6">
          {bundle.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{item.name}{item.quantity && item.quantity > 1 && <span className="text-gray-500"> (x{item.quantity})</span>}</span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-3xl font-bold text-gray-900">${bundle.bundlePrice.toFixed(2)}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg text-gray-400 line-through">${bundle.originalTotal.toFixed(2)}</span>
              <span className="text-sm text-green-600 font-semibold">Save ${bundle.savingsAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-right"><div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">{bundle.savingsPercent}% OFF</div></div>
        </div>

        <button onClick={() => onAddToCart?.(bundle.id)} className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isFeatured ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
          <ShoppingCart className="w-5 h-5" />Add to Cart
        </button>
        <p className="text-center text-xs text-gray-500 mt-3">🔒 Secure checkout • 30-day money-back guarantee</p>
      </div>
    </div>
  );
}

interface BundleListProps {
  bundles: UrgencyBundle[];
  columns?: 1 | 2 | 3;
  featuredOnly?: boolean;
  onAddToCart?: (bundleId: string) => void;
}

export function BundleList({ bundles, columns = 2, featuredOnly = false, onAddToCart }: BundleListProps) {
  const displayBundles = featuredOnly ? bundles.filter(b => b.popular || b.bestValue) : bundles;
  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {displayBundles.map((bundle) => (
        <UrgencyBundleCard key={bundle.id} bundle={bundle} variant={bundle.popular || bundle.bestValue ? 'featured' : 'standard'} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
