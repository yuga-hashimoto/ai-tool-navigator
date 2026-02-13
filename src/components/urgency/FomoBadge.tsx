'use client';

import React, { useMemo } from 'react';
import { Flame, Clock, Zap, Star, Users, TrendingUp, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UrgencyLevel } from '@/lib/urgency';

interface FomoBadgeProps {
  urgencyLevel: UrgencyLevel;
  variant?: 'default' | 'pulse' | 'glow' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  customText?: string;
  className?: string;
}

export function FomoBadge({
  urgencyLevel,
  variant = 'default',
  size = 'md',
  showIcon = true,
  customText,
  className
}: FomoBadgeProps) {
  const config = useMemo(() => {
    if (customText) {
      return {
        text: customText,
        variant: 'warning',
        pulse: urgencyLevel === 'critical'
      };
    }
    
    const configs: Record<UrgencyLevel, { text: string; variant: string; pulse: boolean }> = {
      critical: { text: '🔥 Selling Fast!', variant: 'danger', pulse: true },
      high: { text: '⚡ Almost Gone!', variant: 'warning', pulse: true },
      medium: { text: '⏰ Limited Time', variant: 'info', pulse: false },
      low: { text: '✨ Best Value', variant: 'success', pulse: false }
    };
    
    return configs[urgencyLevel];
  }, [urgencyLevel, customText]);
  
  const variantClasses = {
    default: getDefaultVariantClasses(urgencyLevel),
    pulse: getPulseVariantClasses(urgencyLevel),
    glow: getGlowVariantClasses(urgencyLevel),
    outline: getOutlineVariantClasses(urgencyLevel)
  };
  
  const iconSize = { sm: 12, md: 16, lg: 20 }[size];
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs',
      variantClasses[variant],
      className
    )}>
      {showIcon && <FomoIcon type={urgencyLevel} size={iconSize} />}
      {config.text}
    </span>
  );
}

interface UrgencyBannerProps {
  urgencyLevel: UrgencyLevel;
  title: string;
  subtitle?: string;
  cta?: { text: string; onClick: () => void };
  className?: string;
}

export function UrgencyBanner({
  urgencyLevel,
  title,
  subtitle,
  cta,
  className
}: UrgencyBannerProps) {
  const bgClasses: Record<UrgencyLevel, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg text-white',
      bgClasses[urgencyLevel],
      (urgencyLevel === 'critical' || urgencyLevel === 'high') && 'animate-pulse',
      className
    )}>
      <div className="relative px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UrgencyIcon level={urgencyLevel} className="w-5 h-5" />
          <div>
            <p className="font-bold">{title}</p>
            {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
          </div>
        </div>
        {cta && (
          <button
            onClick={cta.onClick}
            className="px-4 py-2 bg-white text-gray-900 rounded-full font-semibold text-sm hover:bg-gray-100"
          >
            {cta.text}
          </button>
        )}
      </div>
    </div>
  );
}

interface UrgencyCtaProps {
  urgencyLevel: UrgencyLevel;
  text: string;
  onClick: () => void;
  discount?: number;
  className?: string;
}

export function UrgencyCta({ urgencyLevel, text, onClick, discount, className }: UrgencyCtaProps) {
  const variantClasses: Record<UrgencyLevel, string> = {
    critical: 'bg-red-500 hover:bg-red-600 text-white',
    high: 'bg-orange-500 hover:bg-orange-600 text-white',
    medium: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    low: 'bg-green-500 hover:bg-green-600 text-white'
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all',
        variantClasses[urgencyLevel],
        (urgencyLevel === 'critical' || urgencyLevel === 'high') && 'animate-pulse',
        className
      )}
    >
      {discount && discount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
          -{discount}%
        </span>
      )}
      <Zap className="w-5 h-5" />
      {text}
    </button>
  );
}

interface SocialProofBadgeProps {
  viewerCount?: number;
  recentPurchases?: number;
  timeframe?: string;
  className?: string;
}

export function SocialProofBadge({ viewerCount, recentPurchases, timeframe = 'last hour', className }: SocialProofBadgeProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700',
      className
    )}>
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4" />
        {viewerCount && <span className="font-semibold">{viewerCount}</span>}
      </div>
      {recentPurchases && (
        <>
          <span className="text-green-500">•</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {recentPurchases} purchased
          </span>
        </>
      )}
      <span className="text-green-500 opacity-60">|</span>
      <span className="opacity-75">in {timeframe}</span>
    </div>
  );
}

interface LimitedQuantityBadgeProps {
  quantity: number;
  sold: number;
  className?: string;
}

export function LimitedQuantityBadge({ quantity, sold, className }: LimitedQuantityBadgeProps) {
  const remaining = quantity - sold;
  const percentage = (remaining / quantity) * 100;
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Gift className="w-4 h-4 text-purple-600" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-purple-700">Only {remaining} left!</span>
        <div className="w-20 h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
}

export function CompactFomoIndicator({ urgencyLevel, className }: { urgencyLevel: UrgencyLevel; className?: string }) {
  const messages: Record<UrgencyLevel, string> = {
    critical: '🔥 Selling fast!',
    high: '⚡ Almost gone',
    medium: '⏳ Limited time',
    low: '✓ Best price'
  };
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-medium',
      {
        'text-red-600': urgencyLevel === 'critical',
        'text-orange-600': urgencyLevel === 'high',
        'text-yellow-600': urgencyLevel === 'medium',
        'text-green-600': urgencyLevel === 'low'
      },
      className
    )}>
      {messages[urgencyLevel]}
    </span>
  );
}

function FomoIcon({ type, size }: { type: UrgencyLevel; size: number }) {
  const colorClass = { critical: 'text-red-500', high: 'text-orange-500', medium: 'text-yellow-500', low: 'text-green-500' }[type];
  const icons: Record<UrgencyLevel, React.ReactNode> = {
    critical: <Flame className={colorClass} size={size} />,
    high: <Zap className={colorClass} size={size} />,
    medium: <Clock className={colorClass} size={size} />,
    low: <Star className={colorClass} size={size} />
  };
  return icons[type];
}

function UrgencyIcon({ level, className }: { level: UrgencyLevel; className?: string }) {
  const icons: Record<UrgencyLevel, React.ReactNode> = {
    critical: <Flame className={className} />,
    high: <Zap className={className} />,
    medium: <Clock className={className} />,
    low: <Star className={className} />
  };
  return icons[level];
}

function getDefaultVariantClasses(level: UrgencyLevel): string {
  return { critical: 'bg-red-500 text-white', high: 'bg-orange-500 text-white', medium: 'bg-yellow-500 text-black', low: 'bg-green-500 text-white' }[level];
}

function getPulseVariantClasses(level: UrgencyLevel): string {
  return { critical: 'bg-red-500 text-white animate-pulse', high: 'bg-orange-500 text-white animate-pulse', medium: 'bg-yellow-500 text-black', low: 'bg-green-500 text-white' }[level];
}

function getGlowVariantClasses(level: UrgencyLevel): string {
  return { critical: 'bg-red-500 text-white shadow-lg shadow-red-500/50', high: 'bg-orange-500 text-white shadow-lg shadow-orange-500/50', medium: 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50', low: 'bg-green-500 text-white shadow-lg shadow-green-500/50' }[level];
}

function getOutlineVariantClasses(level: UrgencyLevel): string {
  return { critical: 'border-2 border-red-500 text-red-600 bg-transparent', high: 'border-2 border-orange-500 text-orange-600 bg-transparent', medium: 'border-2 border-yellow-500 text-yellow-600 bg-transparent', low: 'border-2 border-green-500 text-green-600 bg-transparent' }[level];
}
