'use client';

import React, { useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';
import { UrgencyLevel, UrgencyBadgeConfig } from '@/lib/urgency';

interface CountdownTimerProps {
  expirationDate: Date;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'badge';
  showLabels?: boolean;
  showProgress?: boolean;
  onExpired?: () => void;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export function CountdownTimer({
  expirationDate,
  className,
  variant = 'default',
  showLabels = true,
  showProgress = false,
  onExpired,
  size = 'md',
  theme = 'dark'
}: CountdownTimerProps) {
  const { timeRemaining, isExpired, progress, formatted } = useCountdown(expirationDate, { onExpired });
  
  const urgencyLevel = useMemo<UrgencyLevel>(() => {
    if (isExpired) return 'low';
    const totalMs = timeRemaining.days * 86400000 + 
                   timeRemaining.hours * 3600000 + 
                   timeRemaining.minutes * 60000 + 
                   timeRemaining.seconds * 1000;
    const hours = totalMs / 3600000;
    
    if (hours < 1) return 'critical';
    if (hours < 6) return 'high';
    if (hours < 24) return 'medium';
    return 'low';
  }, [timeRemaining, isExpired]);
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  };
  
  if (variant === 'badge') {
    return (
      <BadgeCountdown
        urgencyLevel={urgencyLevel}
        timeRemaining={formatted}
        isExpired={isExpired}
        className={className}
      />
    );
  }
  
  if (variant === 'compact') {
    return (
      <CompactCountdown
        timeRemaining={timeRemaining}
        urgencyLevel={urgencyLevel}
        isExpired={isExpired}
        className={className}
        size={size}
      />
    );
  }
  
  if (variant === 'minimal') {
    return (
      <MinimalCountdown
        timeRemaining={timeRemaining}
        isExpired={isExpired}
        className={className}
        onExpired={onExpired}
      />
    );
  }
  
  return (
    <DefaultCountdown
      timeRemaining={timeRemaining}
      urgencyLevel={urgencyLevel}
      isExpired={isExpired}
      progress={progress}
      showLabels={showLabels}
      showProgress={showProgress}
      className={className}
      size={size}
      theme={theme}
      iconSizes={iconSizes}
    />
  );
}

// Default full countdown display
interface DefaultCountdownProps {
  timeRemaining: { days: number; hours: number; minutes: number; seconds: number };
  urgencyLevel: UrgencyLevel;
  isExpired: boolean;
  progress: number;
  showLabels: boolean;
  showProgress: boolean;
  className?: string;
  size: 'sm' | 'md' | 'lg';
  theme: 'light' | 'dark';
  iconSizes: { sm: number; md: number; lg: number };
}

function DefaultCountdown({
  timeRemaining,
  urgencyLevel,
  isExpired,
  progress,
  showLabels,
  showProgress,
  className,
  size,
  theme,
  iconSizes
}: DefaultCountdownProps) {
  const themeClasses = theme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-900';
  
  const urgencyColor = getUrgencyColor(urgencyLevel);
  
  if (isExpired) {
    return (
      <div className={cn(
        'flex items-center justify-center gap-2 p-4 rounded-lg',
        themeClasses,
        className
      )}>
        <CheckCircle className={cn('w-6 h-6', urgencyColor)} />
        <span className="font-semibold">Offer Expired</span>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'rounded-lg overflow-hidden',
      themeClasses,
      className
    )}>
      {/* Progress bar */}
      {showProgress && (
        <div className="h-1 bg-gray-200">
          <div
            className={cn('h-full transition-all duration-500', urgencyColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Timer display */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Urgency indicator */}
          <div className={cn('flex items-center gap-2', urgencyColor)}>
            <Clock size={iconSizes[size]} />
            <span className={cn('font-medium', sizeClasses[size])}>
              {getUrgencyLabel(urgencyLevel)}
            </span>
          </div>
          
          {/* Time units */}
          <div className="flex gap-2 sm:gap-3">
            <TimeUnit
              value={timeRemaining.days}
              label="Days"
              size={size}
              urgencyLevel={urgencyLevel}
            />
            <Separator />
            <TimeUnit
              value={timeRemaining.hours}
              label="Hrs"
              size={size}
              urgencyLevel={urgencyLevel}
            />
            <Separator />
            <TimeUnit
              value={timeRemaining.minutes}
              label="Mins"
              size={size}
              urgencyLevel={urgencyLevel}
            />
            <Separator />
            <TimeUnit
              value={timeRemaining.seconds}
              label="Secs"
              size={size}
              urgencyLevel={urgencyLevel}
              pulse={urgencyLevel === 'critical' || urgencyLevel === 'high'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact countdown for smaller spaces
interface CompactCountdownProps {
  timeRemaining: { days: number; hours: number; minutes: number; seconds: number };
  urgencyLevel: UrgencyLevel;
  isExpired: boolean;
  className?: string;
  size: 'sm' | 'md' | 'lg';
}

function CompactCountdown({
  timeRemaining,
  urgencyLevel,
  isExpired,
  className,
  size
}: CompactCountdownProps) {
  const urgencyColor = getUrgencyColor(urgencyLevel);
  
  if (isExpired) {
    return (
      <span className={cn('text-red-500 font-medium', className)}>
        Expired
      </span>
    );
  }
  
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Clock className={cn('w-4 h-4', urgencyColor)} />
      <span className={urgencyColor}>
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {timeRemaining.hours}h {timeRemaining.minutes}m
      </span>
    </span>
  );
}

// Minimal countdown - just time remaining
interface MinimalCountdownProps {
  timeRemaining: { days: number; hours: number; minutes: number; seconds: number };
  isExpired: boolean;
  className?: string;
  onExpired?: () => void;
}

function MinimalCountdown({
  timeRemaining,
  isExpired,
  className,
  onExpired
}: MinimalCountdownProps) {
  if (isExpired) {
    return (
      <span className={cn('text-gray-500', className)} onClick={onExpired}>
        Expired
      </span>
    );
  }
  
  return (
    <time className={cn('font-mono', className)}>
      {timeRemaining.hours.toString().padStart(2, '0')}:
      {timeRemaining.minutes.toString().padStart(2, '0')}:
      {timeRemaining.seconds.toString().padStart(2, '0')}
    </time>
  );
}

// Badge-style countdown
interface BadgeCountdownProps {
  urgencyLevel: UrgencyLevel;
  timeRemaining: string;
  isExpired: boolean;
  className?: string;
}

function BadgeCountdown({
  urgencyLevel,
  timeRemaining,
  isExpired,
  className
}: BadgeCountdownProps) {
  const badgeConfig: Record<UrgencyLevel, { icon: React.ReactNode; className: string }> = {
    critical: {
      icon: <AlertTriangle className="w-3 h-3" />,
      className: 'bg-red-500 text-white animate-pulse'
    },
    high: {
      icon: <Clock className="w-3 h-3" />,
      className: 'bg-orange-500 text-white'
    },
    medium: {
      icon: <Clock className="w-3 h-3" />,
      className: 'bg-yellow-500 text-black'
    },
    low: {
      icon: <CheckCircle className="w-3 h-3" />,
      className: 'bg-green-500 text-white'
    }
  };
  
  const config = badgeConfig[urgencyLevel];
  
  if (isExpired) {
    return null;
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      config.className,
      className
    )}>
      {config.icon}
      <span>{timeRemaining}</span>
    </span>
  );
}

// Time unit component
interface TimeUnitProps {
  value: number;
  label: string;
  size: 'sm' | 'md' | 'lg';
  urgencyLevel?: UrgencyLevel;
  pulse?: boolean;
}

function TimeUnit({ value, label, size, urgencyLevel, pulse }: TimeUnitProps) {
  const fontSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <div className={cn('flex flex-col items-center', pulse && 'animate-pulse')}>
      <span className={cn(
        'font-bold font-mono tabular-nums leading-none',
        fontSizeClasses[size],
        urgencyLevel && getUrgencyColor(urgencyLevel)
      )}>
        {value.toString().padStart(2, '0')}
      </span>
      {label && (
        <span className="text-[10px] uppercase opacity-70 mt-1">
          {label}
        </span>
      )}
    </div>
  );
}

// Separator component
function Separator() {
  return <span className="text-gray-400 self-start mt-1">:</span>;
}

// Utility functions
function getUrgencyColor(level: UrgencyLevel): string {
  const colors: Record<UrgencyLevel, string> = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-green-500'
  };
  return colors[level];
}

function getUrgencyLabel(level: UrgencyLevel): string {
  const labels: Record<UrgencyLevel, string> = {
    critical: 'ENDING SOON!',
    high: 'Limited Time',
    medium: 'Offer Ends',
    low: 'Valid Until'
  };
  return labels[level];
}

// Size classes mapping
const sizeClasses: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};
