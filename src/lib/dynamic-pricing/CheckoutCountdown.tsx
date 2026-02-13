'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Lock, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { getCheckoutCountdown } from './dynamicPricing';

interface CheckoutCountdownProps {
  variant?: 'standard' | 'compact' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showProgressBar?: boolean;
  autoStart?: boolean;
  onExpire?: () => void;
  onExtend?: () => void;
  className?: string;
}

export default function CheckoutCountdown({ variant = 'standard', size = 'md', showProgressBar = true, autoStart = true, onExpire, onExtend, className = '' }: CheckoutCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [config, setConfig] = useState(getCheckoutCountdown('standard'));

  const initializeCountdown = useCallback(() => {
    const countdownConfig = getCheckoutCountdown('standard');
    setConfig(countdownConfig);
    setTimeRemaining(countdownConfig.duration * 60);
    setIsExpired(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (autoStart) initializeCountdown();
  }, [autoStart, initializeCountdown]);

  useEffect(() => {
    if (isPaused || isExpired) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { setIsExpired(true); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isExpired, onExpire]);

  const getUrgencyLevel = () => {
    const totalMinutes = timeRemaining / 60;
    if (totalMinutes <= 2) return 'critical';
    if (totalMinutes <= 5) return 'high';
    if (totalMinutes <= 10) return 'medium';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();

  const colorScheme = {
    critical: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-800', accent: 'text-red-600', progress: 'bg-red-500', pulse: true },
    high: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-800', accent: 'text-orange-600', progress: 'bg-orange-500', pulse: false },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-800', accent: 'text-yellow-600', progress: 'bg-yellow-500', pulse: false },
    low: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-800', accent: 'text-blue-600', progress: 'bg-blue-500', pulse: false }
  };

  const colors = colorScheme[urgencyLevel as keyof typeof colorScheme];
  const progress = (timeRemaining / (config.duration * 60)) * 100;

  const sizeStyles = {
    sm: { container: 'p-3', icon: 'w-4 h-4', time: 'text-lg', label: 'text-xs' },
    md: { container: 'p-4', icon: 'w-5 h-5', time: 'text-2xl', label: 'text-sm' },
    lg: { container: 'p-6', icon: 'w-6 h-6', time: 'text-3xl', label: 'text-base' }
  };

  const styles = sizeStyles[size];
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs.toString().padStart(2, '0')}`; };

  if (isExpired) {
    return (
      <div className={className}>
        <div className={`${styles.container} ${colors.bg} ${colors.border} border rounded-xl text-center`}>
          <AlertTriangle className={`${styles.icon} ${colors.accent} mx-auto mb-2`} />
          <p className={`${colors.text} font-semibold mb-2`}>Time&apos;s up!</p>
          <p className="text-gray-600 text-sm mb-3">Your discounted price is no longer available.</p>
          {onExtend && <button onClick={onExtend} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"><RefreshCw className="w-4 h-4" />Extend Timer</button>}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Clock className={`${styles.icon} ${colors.accent}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`${styles.time} font-mono font-bold ${colors.text}`}>{formatTime(timeRemaining)}</span>
            {showProgressBar && <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`${colors.progress} h-full transition-all duration-1000`} style={{ width: `${progress}%` }} /></div>}
          </div>
          <p className="text-xs text-gray-500">{config.urgencyMessage}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {colors.pulse && <span className="relative flex h-3 w-3"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.accent.replace('text-', 'bg-')} opacity-75`}></span><span className={`relative inline-flex rounded-full h-3 w-3 ${colors.accent.replace('text-', 'bg-')}`}></span></span>}
        <Clock className={`${styles.icon} ${colors.accent}`} />
        <span className={`${styles.time} font-mono font-bold ${colors.text}`}>{formatTime(timeRemaining)}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`${styles.container} ${colors.bg} ${colors.border} border rounded-xl`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors.accent.replace('text-', 'bg-')}/10`}>{config.priceLock ? <Lock className={`${styles.icon} ${colors.accent}`} /> : <Clock className={`${styles.icon} ${colors.accent}`} />}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><span className={`font-bold ${colors.text}`}>Price Locked!</span>{colors.pulse && <span className="flex h-2 w-2"><span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${colors.accent.replace('text-', 'bg-')} opacity-75`}></span><span className={`relative inline-flex rounded-full h-2 w-2 ${colors.accent.replace('text-', 'bg-')}`}></span></span>}</div>
              <button onClick={() => setIsPaused(!isPaused)} className="text-xs text-gray-500 hover:text-gray-700">{isPaused ? 'Resume' : 'Pause'}</button>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className={`${styles.time} font-mono font-bold ${colors.text}`}>{formatTime(timeRemaining)}</span>
              <div className="flex-1">{showProgressBar && <div className="h-2 bg-white rounded-full overflow-hidden"><div className={`${colors.progress} h-full transition-all duration-1000`} style={{ width: `${progress}%` }} /></div>}</div>}
            </div>
            <p className={`text-sm ${colors.text} flex items-center gap-1`}>{config.discountGuaranteed && <><Check className="w-4 h-4" />{config.urgencyMessage}</>}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <button onClick={() => window.location.href = '/checkout'} className={`w-full py-2 ${colors.accent.replace('text-', 'bg-')} ${colors.text} font-semibold rounded-lg hover:opacity-90 transition-opacity`}>Complete Checkout Now</button>
        </div>
      </div>
      {urgencyLevel === 'critical' && <div className="mt-3 p-3 bg-red-100 rounded-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" /><p className="text-sm text-red-700"><strong>Hurry!</strong> Complete checkout within {formatTime(timeRemaining)} to keep your discount.</p></div>}
    </div>
  );
}
