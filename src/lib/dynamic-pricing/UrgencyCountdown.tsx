'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface UrgencyCountdownProps {
  endDate: Date;
  variant?: 'standard' | 'compact' | 'full';
  size?: 'sm' | 'md' | 'lg';
  onExpire?: () => void;
  showLabels?: boolean;
  className?: string;
}

export default function UrgencyCountdown({
  endDate,
  variant = 'standard',
  size = 'md',
  onExpire,
  showLabels = true,
  className = ''
}: UrgencyCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const total = endDate.getTime() - new Date().getTime();
      
      if (total <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          isExpired: true
        });
        onExpire?.();
        return;
      }

      setTimeRemaining({
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((total % (1000 * 60)) / 1000),
        total,
        isExpired: false
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  // Size styles
  const sizeStyles = {
    sm: { container: 'gap-1', number: 'text-sm', label: 'text-xs' },
    md: { container: 'gap-2', number: 'text-lg', label: 'text-xs' },
    lg: { container: 'gap-3', number: 'text-2xl', label: 'text-sm' }
  };

  // Urgency level based on time remaining
  const getUrgencyLevel = () => {
    const { days, hours, total } = timeRemaining;
    if (total < 60 * 60 * 1000) return 'critical'; // Less than 1 hour
    if (days === 0 && hours < 6) return 'high';
    if (days === 0) return 'medium';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();

  // Color scheme based on urgency
  const colorScheme = {
    critical: {
      bg: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-700',
      number: 'text-red-800',
      pulse: true
    },
    high: {
      bg: 'bg-orange-100',
      border: 'border-orange-500',
      text: 'text-orange-700',
      number: 'text-orange-800',
      pulse: false
    },
    medium: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      number: 'text-yellow-800',
      pulse: false
    },
    low: {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-700',
      number: 'text-blue-800',
      pulse: false
    }
  };

  const colors = colorScheme[urgencyLevel];

  if (timeRemaining.isExpired) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Offer has expired</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className={`w-4 h-4 ${colors.text}`} />
        <span className={`${colors.text} font-medium`}>
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {timeRemaining.hours}h {timeRemaining.minutes}m
        </span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {urgencyLevel === 'critical' && (
        <div className={`mb-2 p-2 ${colors.bg} ${colors.text} rounded text-center text-sm font-medium animate-pulse`}>
          ⏰ Ending soon! Don&apos;t miss out!
        </div>
      )}
      
      <div className={`flex items-center justify-center ${sizeStyles[size].container}`}>
        {timeRemaining.days > 0 && (
          <div className={`flex flex-col items-center ${colors.bg} rounded-lg p-2 min-w-[60px]`}>
            <span className={`${sizeStyles[size].number} font-bold ${colors.number}`}>
              {timeRemaining.days}
            </span>
            {showLabels && (
              <span className={`${sizeStyles[size].label} ${colors.text}`}>
                Days
              </span>
            )}
          </div>
        )}
        
        <div className={`flex flex-col items-center ${colors.bg} rounded-lg p-2 min-w-[60px]`}>
          <span className={`${sizeStyles[size].number} font-bold ${colors.number}`}>
            {String(timeRemaining.hours).padStart(2, '0')}
          </span>
          {showLabels && (
            <span className={`${sizeStyles[size].label} ${colors.text}`}>
              Hours
            </span>
          )}
        </div>
        
        <span className={`${colors.text} text-xl font-bold`}>:</span>
        
        <div className={`flex flex-col items-center ${colors.bg} rounded-lg p-2 min-w-[60px]`}>
          <span className={`${sizeStyles[size].number} font-bold ${colors.number}`}>
            {String(timeRemaining.minutes).padStart(2, '0')}
          </span>
          {showLabels && (
            <span className={`${sizeStyles[size].label} ${colors.text}`}>
              Minutes
            </span>
          )}
        </div>
        
        <span className={`${colors.text} text-xl font-bold`}>:</span>
        
        <div className={`flex flex-col items-center ${colors.bg} rounded-lg p-2 min-w-[60px]`}>
          <span className={`${sizeStyles[size].number} font-bold ${colors.number}`}>
            {String(timeRemaining.seconds).padStart(2, '0')}
          </span>
          {showLabels && (
            <span className={`${sizeStyles[size].label} ${colors.text}`}>
              Seconds
            </span>
          )}
        </div>
      </div>

      {urgencyLevel === 'high' && (
        <p className={`mt-2 text-center text-sm ${colors.text}`}>
          Offer expires soon!
        </p>
      )}
    </div>
  );
}
