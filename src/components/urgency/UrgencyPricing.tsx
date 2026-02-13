'use client';

import React, { useMemo } from 'react';
import { TrendingDown, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UrgencyLevel, calculateDynamicDiscount } from '@/lib/urgency';
import { CountdownTimer } from './CountdownTimer';

interface DynamicPricingTier {
  id: string;
  name: string;
  basePrice: number;
  features: string[];
  popular?: boolean;
}

interface UrgencyPricingProps {
  tiers: DynamicPricingTier[];
  currentTier?: string;
  urgencyLevel: UrgencyLevel;
  expirationDate: Date;
  onTierSelect: (tierId: string) => void;
  className?: string;
  showSavings?: boolean;
}

export function UrgencyPricing({
  tiers,
  currentTier,
  urgencyLevel,
  expirationDate,
  onTierSelect,
  className,
  showSavings = true
}: UrgencyPricingProps) {
  const urgencyDiscount = useMemo<number>(() => calculateDynamicDiscount(10, urgencyLevel, 50), [urgencyLevel]);
  
  const urgencyLabel: Record<UrgencyLevel, string> = {
    critical: 'Flash Sale!',
    high: 'Limited Offer',
    medium: 'Special Deal',
    low: 'Best Value'
  };
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{urgencyLabel[urgencyLevel]} ends in:</span>
          {urgencyDiscount > 0 && <span className="text-sm font-bold text-green-600">{urgencyDiscount}% OFF</span>}
        </div>
        <CountdownTimer expirationDate={expirationDate} variant="default" showProgress />
      </div>
      
      <div className={cn(tiers.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2', 'grid gap-4')}>
        {tiers.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            urgencyLevel={urgencyLevel}
            urgencyDiscount={urgencyDiscount}
            isCurrentTier={tier.id === currentTier}
            onSelect={() => onTierSelect(tier.id)}
            showSavings={showSavings}
          />
        ))}
      </div>
    </div>
  );
}

interface PricingCardProps {
  tier: DynamicPricingTier;
  urgencyLevel: UrgencyLevel;
  urgencyDiscount: number;
  isCurrentTier: boolean;
  onSelect: () => void;
  showSavings: boolean;
}

function PricingCard({ tier, urgencyLevel, urgencyDiscount, isCurrentTier, onSelect, showSavings }: PricingCardProps) {
  const discountedPrice = Math.round(tier.basePrice - (tier.basePrice * urgencyDiscount) / 100);
  const savings = tier.basePrice - discountedPrice;
  
  const borderColors: Record<UrgencyLevel, string> = { critical: 'border-red-500', high: 'border-orange-500', medium: 'border-yellow-500', low: 'border-green-500' };
  const bgColors: Record<UrgencyLevel, string> = { critical: 'bg-red-50', high: 'bg-orange-50', medium: 'bg-yellow-50', low: 'bg-green-50' };
  
  return (
    <div className={cn(
      'relative p-6 rounded-xl border-2 transition-all hover:shadow-lg',
      isCurrentTier ? borderColors[urgencyLevel] : 'border-gray-200 hover:border-gray-300',
      bgColors[urgencyLevel],
      isCurrentTier && 'ring-2 ring-offset-2'
    )}>
      {tier.popular && (
        <span className={cn(
          'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white',
          urgencyLevel === 'critical' ? 'bg-red-500' : urgencyLevel === 'high' ? 'bg-orange-500' : urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        )}>
          Most Popular
        </span>
      )}
      
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-gray-900">${discountedPrice}</span>
          {showSavings && savings > 0 && <span className="text-sm text-gray-500 line-through">${tier.basePrice}</span>}
        </div>
        {urgencyDiscount > 0 && !tier.popular && (
          <div className={cn(
            'mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            urgencyLevel === 'critical' ? 'bg-red-100 text-red-700' : urgencyLevel === 'high' ? 'bg-orange-100 text-orange-700' : urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
          )}>
            <TrendingDown className="w-3 h-3" />
            Save ${savings} with urgency deal!
          </div>
        )}
      </div>
      
      <ul className="space-y-2 mb-6">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={onSelect}
        disabled={isCurrentTier}
        className={cn(
          'w-full py-2.5 rounded-lg font-semibold transition-all',
          isCurrentTier ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
          urgencyLevel === 'critical' ? 'bg-red-500 hover:bg-red-600 text-white' :
          urgencyLevel === 'high' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
          urgencyLevel === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
          'bg-green-500 hover:bg-green-600 text-white'
        )}
      >
        {isCurrentTier ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
}

interface CompactPricingProps {
  originalPrice: number;
  urgencyLevel: UrgencyLevel;
  className?: string;
}

export function CompactPricing({ originalPrice, urgencyLevel, className }: CompactPricingProps) {
  const discount = useMemo<number>(() => calculateDynamicDiscount(10, urgencyLevel, 50), [urgencyLevel]);
  const discountedPrice = originalPrice - (originalPrice * discount / 100);
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xl font-bold text-gray-900">${discountedPrice.toFixed(2)}</span>
      <span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
      <span className={cn(
        'px-1.5 py-0.5 rounded text-xs font-bold text-white',
        urgencyLevel === 'critical' ? 'bg-red-500' : urgencyLevel === 'high' ? 'bg-orange-500' : urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
      )}>
        -{discount}%
      </span>
    </div>
  );
}

interface PriceCountdownProps {
  originalPrice: number;
  currentPrice: number;
  expirationDate: Date;
  onPurchase?: () => void;
  className?: string;
}

export function PriceCountdown({ originalPrice, currentPrice, expirationDate, onPurchase, className }: PriceCountdownProps) {
  const savings = originalPrice - currentPrice;
  const percentageOff = Math.round((savings / originalPrice) * 100);
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white p-6',
      className
    )}>
      <div className="absolute inset-0 bg-white/10 animate-pulse" />
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">-{percentageOff}%</div>
            <div className="text-sm opacity-90">OFF</div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${currentPrice}</span>
              <span className="text-lg opacity-75 line-through">${originalPrice}</span>
            </div>
            <div className="text-sm opacity-90">You save ${savings.toFixed(2)}!</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CountdownTimer expirationDate={expirationDate} variant="compact" theme="light" />
          {onPurchase && (
            <button onClick={onPurchase} className="px-6 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100">
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PriceLockIndicatorProps {
  lockedPrice: number;
  regularPrice: number;
  expiresAt: Date;
  className?: string;
}

export function PriceLockIndicator({ lockedPrice, regularPrice, expiresAt, className }: PriceLockIndicatorProps) {
  const savings = regularPrice - lockedPrice;
  
  return (
    <div className={cn('flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg', className)}>
      <div className="p-2 bg-green-100 rounded-full"><Check className="w-5 h-5 text-green-600" /></div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-green-800">${lockedPrice} locked price!</span>
          <span className="text-xs px-1.5 py-0.5 bg-green-200 text-green-800 rounded">Save ${savings}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
          <Clock className="w-3 h-3" />
          Price expires: {expiresAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
