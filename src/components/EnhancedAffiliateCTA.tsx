'use client';

import React, { useState, useEffect } from 'react';
import { AffiliateLinkButton } from './AffiliateLinkButton';
import { Timer, TrendingUp, Users, Star, Zap, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AffiliateCTAProps {
  href: string;
  toolSlug: string;
  toolName: string;
  affiliateId?: string;
  ctaText?: string;
  variant?: 'default' | 'urgent' | 'popular' | 'exclusive';
  showSocialProof?: boolean;
  showUrgency?: boolean;
  ratings?: number;
  users?: string;
  className?: string;
  position?: string;
  source?: string;
  campaign?: string;
}

// A/B test variants
type ABTestVariant = 'control' | 'urgency' | 'social' | 'combined';

export function EnhancedAffiliateCTA({
  href,
  toolSlug,
  toolName,
  affiliateId,
  ctaText = 'Get Started',
  variant = 'default',
  showSocialProof = false,
  showUrgency = false,
  ratings,
  users,
  className,
  position = 'tool_page',
  source = 'ai-tools-navigator',
  campaign,
}: AffiliateCTAProps) {
  const [abVariant, setAbVariant] = useState<ABTestVariant>('control');
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [clickCount, setClickCount] = useState(0);

  // A/B test assignment (consistent per session)
  useEffect(() => {
    const storedVariant = sessionStorage.getItem(`ab_cta_${toolSlug}`);
    if (storedVariant) {
      setAbVariant(storedVariant as ABTestVariant);
    } else {
      // Weighted random assignment
      const variants: ABTestVariant[] = ['control', 'urgency', 'social', 'combined'];
      const weights = [0.25, 0.25, 0.25, 0.25];
      const random = Math.random();
      let cumulative = 0;
      for (let i = 0; i < variants.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          setAbVariant(variants[i]);
          sessionStorage.setItem(`ab_cta_${toolSlug}`, variants[i]);
          // Track A/B assignment
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'ab_test_assignment', {
              test_name: 'enhanced_cta',
              variant: variants[i],
              tool_slug: toolSlug,
            });
          }
          break;
        }
      }
    }
  }, [toolSlug]);

  // Countdown timer for urgency
  useEffect(() => {
    if (abVariant !== 'urgency' && abVariant !== 'combined') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [abVariant]);

  // Track click for analytics
  const handleClick = () => {
    setClickCount(prev => prev + 1);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'enhanced_cta_click', {
        tool_slug: toolSlug,
        tool_name: toolName,
        ab_variant: abVariant,
        position,
        source,
      });
    }
  };

  // Dynamic button styles based on variant and A/B test
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5';

    switch (variant) {
      case 'urgent':
        return cn(baseStyles, 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 animate-pulse');
      case 'popular':
        return cn(baseStyles, 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600');
      case 'exclusive':
        return cn(baseStyles, 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500');
      default:
        return cn(baseStyles, 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600');
    }
  };

  const formatCountdown = () => {
    return `${countdown.hours.toString().padStart(2, '0')}:${countdown.minutes.toString().padStart(2, '0')}:${countdown.seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* A/B Test: Urgency Banner */}
      {(abVariant === 'urgency' || abVariant === 'combined') && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium animate-pulse">
          <Timer className="w-4 h-4" />
          <span>Limited time offer ends in {formatCountdown()}</span>
        </div>
      )}

      {/* A/B Test: Social Proof */}
      {(abVariant === 'social' || abVariant === 'combined') && showSocialProof && users && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{users} users signed up this week</span>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-gray-800" />
            ))}
          </div>
        </div>
      )}

      {/* Main CTA Button */}
      <AffiliateLinkButton
        href={href}
        toolSlug={toolSlug}
        toolName={toolName}
        affiliateId={affiliateId}
        className={getButtonStyles()}
        position={position}
        source={source}
        campaign={campaign}
        onClick={handleClick}
      >
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </AffiliateLinkButton>

      {/* Trust Indicators */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {ratings && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{ratings.toFixed(1)} rating</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span>Verified Partner</span>
        </div>
      </div>

      {/* Variant Badge (for popular/exclusive) */}
      {variant === 'popular' && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Popular
        </div>
      )}
      {variant === 'exclusive' && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <Zap className="w-3 h-3 inline mr-1" />
          Exclusive Deal
        </div>
      )}
    </div>
  );
}

export default EnhancedAffiliateCTA;
