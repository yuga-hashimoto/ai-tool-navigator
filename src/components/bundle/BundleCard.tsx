/**
 * Bundle Card Component
 * Displays individual bundle offers with pricing, savings, and CTAs
 */

'use client';

import React, { useState, useEffect } from 'react';
function Badge({ children, variant = 'default', className = '' }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={`${base} ${variants[variant] || ''} ${className}`}>{children}</div>;
}

function Button({ children, onClick, className = '', variant = 'default', disabled = false }: any) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 bg-blue-600 text-white",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground border-zinc-200 dark:border-zinc-800",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || ''} ${className}`}>{children}</button>;
}

import { Bundle } from '@/lib/bundle-system/bundleTypes';
import { 
  ShoppingCart, 
  Tag, 
  Clock, 
  AlertTriangle, 
  Check, 
  Star,
  Sparkles,
  TrendingUp,
  Percent
} from 'lucide-react';

interface BundleCardProps {
  bundle: Bundle;
  onAddToCart?: (bundle: Bundle) => void;
  onViewDetails?: (bundle: Bundle) => void;
  compact?: boolean;
  highlighted?: boolean;
}

export function BundleCard({ 
  bundle, 
  onAddToCart, 
  onViewDetails,
  compact = false,
  highlighted = false
}: BundleCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  // Countdown timer for time-sensitive bundles
  useEffect(() => {
    if (!bundle.countdownEnd) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = bundle.countdownEnd ? new Date(bundle.countdownEnd) : new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bundle.countdownEnd]);

  // Urgency color based on urgency type
  const getUrgencyColor = () => {
    switch (bundle.urgencyType) {
      case 'limited_time':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low_stock':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'price_increase':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'exclusive':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div 
        className={`relative bg-white rounded-xl border-2 transition-all duration-300 ${
          highlighted 
            ? 'border-blue-500 shadow-lg shadow-blue-100' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge */}
        {bundle.badge && (
          <div className="absolute -top-3 left-4 z-10">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              bundle.badgeColor === 'green' ? 'bg-green-500 text-white' :
              bundle.badgeColor === 'blue' ? 'bg-blue-500 text-white' :
              bundle.badgeColor === 'purple' ? 'bg-purple-500 text-white' :
              bundle.badgeColor === 'pink' ? 'bg-pink-500 text-white' :
              bundle.badgeColor === 'orange' ? 'bg-orange-500 text-white' :
              bundle.badgeColor === 'gray' ? 'bg-gray-500 text-white' :
              'bg-gray-200 text-gray-800'
            }`}>
              {bundle.badge}
            </span>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">{bundle.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {bundle.shortDescription}
              </p>
            </div>
            {bundle.popular && (
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            )}
          </div>

          {/* Items Preview */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">
              {bundle.items.length} items included
            </p>
            <div className="flex flex-wrap gap-1">
              {bundle.items.slice(0, 3).map((item, idx) => (
                <span 
                  key={item.id}
                  className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded"
                >
                  {item.name}
                </span>
              ))}
              {bundle.items.length > 3 && (
                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
                  +{bundle.items.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              ${bundle.bundlePrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ${bundle.originalTotal.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-green-600">
              Save {bundle.savingsPercent}%
            </span>
          </div>

          {/* Urgency */}
          {bundle.urgencyType && timeLeft && timeLeft !== 'Expired' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${getUrgencyColor()}`}>
              <Clock className="w-4 h-4" />
              <span>{timeLeft} left</span>
            </div>
          )}

          {bundle.stockRemaining !== undefined && bundle.stockRemaining <= 20 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <span>Only {bundle.stockRemaining} left!</span>
            </div>
          )}

          {/* CTA */}
          <Button 
            className="w-full mt-3" 
            onClick={() => onAddToCart?.(bundle)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart - ${bundle.bundlePrice.toFixed(2)}
          </Button>
        </div>
      </div>
    );
  }

  // Full-size bundle card
  return (
    <div 
      className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 ${
        highlighted 
          ? 'ring-4 ring-blue-100 shadow-2xl scale-[1.02]' 
          : 'hover:shadow-xl hover:-translate-y-1'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient for featured bundles */}
      {bundle.featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      )}

      {/* Badge */}
      {bundle.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span className={`px-4 py-1.5 text-sm font-bold rounded-full shadow-md ${
            bundle.badgeColor === 'green' ? 'bg-green-500 text-white' :
            bundle.badgeColor === 'blue' ? 'bg-blue-500 text-white' :
            bundle.badgeColor === 'purple' ? 'bg-purple-500 text-white' :
            bundle.badgeColor === 'pink' ? 'bg-pink-500 text-white' :
            bundle.badgeColor === 'orange' ? 'bg-orange-500 text-white' :
            bundle.badgeColor === 'gray' ? 'bg-gray-500 text-white' :
            'bg-gray-200 text-gray-800'
          }`}>
            {bundle.badge}
          </span>
        </div>
      )}

      {/* Best Value Badge */}
      {bundle.bestValue && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
            <Sparkles className="w-3 h-3" />
            BEST VALUE
          </div>
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              bundle.type === 'premium' ? 'bg-purple-100 text-purple-700' :
              bundle.type === 'enterprise' ? 'bg-blue-100 text-blue-700' :
              bundle.type === 'pro' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {bundle.type.charAt(0).toUpperCase() + bundle.type.slice(1).replace('_', ' ')}
            </span>
            {bundle.popular && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Most Popular
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {bundle.name}
          </h2>
          <p className="text-gray-600">
            {bundle.description}
          </p>
        </div>

        {/* Items List */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            What's Included
          </h3>
          <div className="space-y-3">
            {bundle.items.map((item) => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  item.required 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'bg-gray-50'
                }`}
              >
                {item.required && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                {!item.required && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">{bundle.items.indexOf(item) + 1}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-500">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${item.required ? 'text-blue-600' : 'text-gray-600'}`}>
                    ${item.originalPrice.toFixed(2)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Block */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Original Price</span>
            <span className="text-gray-400 line-through">
              ${bundle.originalTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Bundle Price</span>
            <span className="text-3xl font-bold text-gray-900">
              ${bundle.bundlePrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">You Save</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">
                ${bundle.savingsAmount.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                {bundle.savingsPercent}% OFF
              </span>
            </div>
          </div>
        </div>

        {/* Urgency Section */}
        {(bundle.urgencyType || bundle.stockRemaining !== undefined) && (
          <div className={`rounded-xl p-4 mb-6 ${getUrgencyColor()}`}>
            {bundle.countdownEnd && timeLeft && timeLeft !== 'Expired' && (
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="font-semibold">{bundle.urgencyMessage || 'Offer ends in:'}</p>
                  <p className="text-lg font-bold">{timeLeft}</p>
                </div>
              </div>
            )}
            {bundle.stockRemaining !== undefined && bundle.stockRemaining <= 20 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-semibold">
                  Only {bundle.stockRemaining} bundles remaining at this price!
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onAddToCart?.(bundle)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          <Button 
            variant="outline"
            onClick={() => onViewDetails?.(bundle)}
          >
            View Details
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{bundle.currentPurchases} bundles sold</span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {bundle.customerSatisfaction.toFixed(1)} rating
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Bundle Grid Component
// =====================================================

interface BundleGridProps {
  bundles: Bundle[];
  columns?: 1 | 2 | 3 | 4;
  compact?: boolean;
  onAddToCart?: (bundle: Bundle) => void;
  onViewDetails?: (bundle: Bundle) => void;
  featuredOnly?: boolean;
}

export function BundleGrid({ 
  bundles, 
  columns = 3,
  compact = false,
  onAddToCart,
  onViewDetails,
  featuredOnly = false
}: BundleGridProps) {
  const displayBundles = featuredOnly 
    ? bundles.filter(b => b.featured || b.bestValue)
    : bundles;

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (displayBundles.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">No bundles available</h3>
        <p className="text-gray-500">Check back soon for amazing bundle deals!</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {displayBundles.map((bundle, index) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          compact={compact}
          highlighted={bundle.bestValue || index === 0}
        />
      ))}
    </div>
  );
}

// =====================================================
// Bundle Savings Badge Component
// =====================================================

interface SavingsBadgeProps {
  savingsPercent: number;
  savingsAmount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SavingsBadge({ savingsPercent, savingsAmount, size = 'md' }: SavingsBadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-lg'
  };

  return (
    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full font-semibold">
      <Percent className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      <span className={sizes[size]}>
        Save {savingsPercent}% (${savingsAmount.toFixed(2)})
      </span>
    </div>
  );
}

export default BundleCard;
