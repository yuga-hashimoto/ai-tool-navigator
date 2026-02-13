'use client';

import { Clock, Tag, Flame, Star, Lock } from 'lucide-react';
import { TimeSensitiveTier } from './dynamicPricing';

interface PricingTierBadgeProps {
  tier: TimeSensitiveTier;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  animated?: boolean;
  className?: string;
}

export default function PricingTierBadge({
  tier,
  size = 'md',
  showDiscount = true,
  animated = true,
  className = ''
}: PricingTierBadgeProps) {
  // Badge color mapping
  const colorSchemes = {
    green: {
      bg: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500'
    },
    red: {
      bg: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: 'text-red-600',
      gradient: 'from-red-500 to-orange-500'
    },
    orange: {
      bg: 'bg-orange-100',
      border: 'border-orange-500',
      text: 'text-orange-800',
      icon: 'text-orange-600',
      gradient: 'from-orange-500 to-yellow-500'
    },
    purple: {
      bg: 'bg-purple-100',
      border: 'border-purple-500',
      text: 'text-purple-800',
      icon: 'text-purple-600',
      gradient: 'from-purple-500 to-indigo-500'
    },
    blue: {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500'
    }
  };

  const colors = colorSchemes[tier.badgeColor as keyof typeof colorSchemes] || colorSchemes.blue;

  // Size styles
  const sizeStyles = {
    sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'w-3 h-3' },
    md: { badge: 'px-3 py-1 text-sm gap-1.5', icon: 'w-4 h-4' },
    lg: { badge: 'px-4 py-1.5 text-base gap-2', icon: 'w-5 h-5' }
  };

  const styles = sizeStyles[size];

  // Icon based on type
  const getIcon = () => {
    switch (tier.type) {
      case 'early_bird':
        return <Star className={styles.icon} />;
      case 'last_chance':
        return <Flame className={styles.icon} />;
      case 'flash_sale':
        return <Clock className={styles.icon} />;
      case 'member_exclusive':
        return <Lock className={styles.icon} />;
      default:
        return <Tag className={styles.icon} />;
    }
  };

  // Urgency indicator
  const urgencyIndicator = () => {
    if (tier.urgencyLevel === 'critical') {
      return (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {animated && tier.urgencyLevel === 'critical' && (
        <div className={`absolute inset-0 rounded-full ${colors.bg} opacity-50 animate-pulse`} />
      )}
      
      <div
        className={`
          inline-flex items-center ${styles.badge}
          ${colors.bg} ${colors.border} border
          ${colors.text} font-semibold rounded-full
          ${animated ? 'shadow-md' : ''}
        `}
      >
        {getIcon()}
        <span>{tier.badge || tier.displayName}</span>
        
        {showDiscount && tier.discountPercent > 0 && (
          <span className={`${colors.icon} font-bold`}>
            -{tier.discountPercent}%
          </span>
        )}
      </div>
      
      {urgencyIndicator()}
    </div>
  );
}

// =====================================================
// STOCK REMAINING COMPONENT
// =====================================================

interface StockRemainingProps {
  current: number;
  max: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StockRemaining({
  current,
  max,
  showPercentage = true,
  size = 'md',
  className = ''
}: StockRemainingProps) {
  const percentage = Math.round((current / max) * 100);
  
  const sizeStyles = {
    sm: { container: 'h-1', text: 'text-xs' },
    md: { container: 'h-2', text: 'text-sm' },
    lg: { container: 'h-3', text: 'text-base' }
  };

  const styles = sizeStyles[size];

  // Stock urgency colors
  const getStockColor = () => {
    if (percentage <= 5) return 'bg-red-500';
    if (percentage <= 15) return 'bg-orange-500';
    if (percentage <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Stock urgency text
  const getStockText = () => {
    if (percentage <= 5) return 'Almost gone!';
    if (percentage <= 15) return 'Selling fast!';
    if (percentage <= 30) return 'Limited stock';
    return 'In stock';
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className={`w-full ${styles.container} bg-gray-200 rounded-full overflow-hidden`}>
          <div
            className={`${getStockColor()} ${styles.container} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className={`${styles.text} text-gray-600`}>
          {getStockText()}
        </span>
        <span className={`${styles.text} text-gray-500`}>
          {current} / {max} remaining
        </span>
      </div>
    </div>
  );
}

// =====================================================
// SAVINGS DISPLAY COMPONENT
// =====================================================

interface SavingsDisplayProps {
  originalPrice: number;
  salePrice: number;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  showAmount?: boolean;
  className?: string;
}

export default function SavingsDisplay({
  originalPrice,
  salePrice,
  size = 'md',
  showPercent = true,
  showAmount = true,
  className = ''
}: SavingsDisplayProps) {
  const savingsAmount = originalPrice - salePrice;
  const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);

  const sizeStyles = {
    sm: { badge: 'px-2 py-0.5 text-xs', amount: 'text-sm' },
    md: { badge: 'px-3 py-1 text-sm', amount: 'text-lg' },
    lg: { badge: 'px-4 py-1.5 text-base', amount: 'text-xl' }
  };

  const styles = sizeStyles[size];

  return (
    <div className={`inline-flex flex-wrap gap-2 ${className}`}>
      {showPercent && (
        <span className={`${styles.badge} bg-red-100 text-red-700 font-bold rounded-full`}>
          -{savingsPercent}% OFF
        </span>
      )}
      
      {showAmount && (
        <span className={`${styles.amount} text-green-600 font-semibold`}>
          Save ${savingsAmount.toFixed(2)}
        </span>
      )}
    </div>
  );
}
