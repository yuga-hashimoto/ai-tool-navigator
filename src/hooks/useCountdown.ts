'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatTimeRemaining, getTimeUntilExpiration } from '@/lib/urgency';

interface UseCountdownOptions {
  onExpired?: () => void;
  intervalMs?: number;
}

interface UseCountdownReturn {
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  totalMs: number;
  isExpired: boolean;
  progress: number; // 0-100 percentage
  formatted: string;
}

export function useCountdown(
  expirationDate: Date,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const { onExpired, intervalMs = 1000 } = options;
  
  const [totalMs, setTotalMs] = useState<number>(() => 
    getTimeUntilExpiration(expirationDate)
  );
  
  const [isExpired, setIsExpired] = useState<boolean>(() => 
    getTimeUntilExpiration(expirationDate) <= 0
  );
  
  useEffect(() => {
    if (isExpired) {
      onExpired?.();
      return;
    }
    
    const timer = setInterval(() => {
      const remaining = getTimeUntilExpiration(expirationDate);
      setTotalMs(remaining);
      
      if (remaining <= 0) {
        setIsExpired(true);
        clearInterval(timer);
        onExpired?.();
      }
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [expirationDate, intervalMs, onExpired, isExpired]);
  
  const timeRemaining = formatTimeRemaining(totalMs);
  
  // Calculate progress percentage (assuming 24hr default duration if not provided)
  const defaultDuration = 24 * 60 * 60 * 1000; // 24 hours
  const progress = Math.min(100, Math.max(0, ((defaultDuration - totalMs) / defaultDuration) * 100));
  
  // Format for display
  const formatted = [
    timeRemaining.days > 0 ? `${timeRemaining.days}d` : '',
    `${timeRemaining.hours}h`,
    `${timeRemaining.minutes}m`,
    `${timeRemaining.seconds}s`
  ].filter(Boolean).join(' ');
  
  return {
    timeRemaining,
    totalMs,
    isExpired,
    progress,
    formatted
  };
}

// Hook for managing countdown with dynamic duration
export function useDynamicCountdown(
  initialDurationMs: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn & {
  reset: (newDuration?: number) => void;
  extend: (additionalMs: number) => void;
} {
  const [startTime] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState<number>(0);
  
  const totalMs = Math.max(0, initialDurationMs - elapsed);
  const isExpired = totalMs <= 0;
  
  const { intervalMs = 1000, onExpired } = options;
  
  useEffect(() => {
    if (isExpired) {
      onExpired?.();
      return;
    }
    
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [isExpired, intervalMs, onExpired, startTime]);
  
  const timeRemaining = formatTimeRemaining(totalMs);
  const progress = Math.min(100, Math.max(0, (elapsed / initialDurationMs) * 100));
  
  const formatted = [
    timeRemaining.days > 0 ? `${timeRemaining.days}d` : '',
    `${timeRemaining.hours}h`,
    `${timeRemaining.minutes}m`,
    `${timeRemaining.seconds}s`
  ].filter(Boolean).join(' ');
  
  const reset = useCallback((newDuration?: number) => {
    setElapsed(0);
    if (newDuration) {
      // This would require a ref to be properly handled
      // For now, just rely on the effect re-running
    }
  }, []);
  
  const extend = useCallback((additionalMs: number) => {
    setElapsed(prev => Math.max(0, prev - additionalMs));
  }, []);
  
  return {
    timeRemaining,
    totalMs,
    isExpired,
    progress,
    formatted,
    reset,
    extend
  };
}

// Hook for countdown with pause/resume capability
export function usePausableCountdown(
  initialDurationMs: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn & {
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  reset: (newDuration?: number) => void;
} {
  const [startTime] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  
  const totalMs = Math.max(0, initialDurationMs - elapsed);
  const isExpired = totalMs <= 0;
  
  const { intervalMs = 1000, onExpired } = options;
  
  useEffect(() => {
    if (isPaused || isExpired) return;
    
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, intervalMs);
    
    return () => clearInterval(timer);
  }, [isPaused, isExpired, intervalMs, startTime]);
  
  useEffect(() => {
    if (isExpired) {
      onExpired?.();
    }
  }, [isExpired, onExpired]);
  
  const timeRemaining = formatTimeRemaining(totalMs);
  const progress = Math.min(100, Math.max(0, (elapsed / initialDurationMs) * 100));
  
  const formatted = [
    timeRemaining.days > 0 ? `${timeRemaining.days}d` : '',
    `${timeRemaining.hours}h`,
    `${timeRemaining.minutes}m`,
    `${timeRemaining.seconds}s`
  ].filter(Boolean).join(' ');
  
  const pause = useCallback(() => {
    if (!isPaused) {
      setPausedAt(Date.now());
      setIsPaused(true);
    }
  }, [isPaused]);
  
  const resume = useCallback(() => {
    if (isPaused && pausedAt !== null) {
      const pauseDuration = Date.now() - pausedAt;
      // Adjust start time to account for pause duration
      setElapsed(prev => prev - pauseDuration);
      setPausedAt(null);
      setIsPaused(false);
    }
  }, [isPaused, pausedAt]);
  
  const reset = useCallback((newDuration?: number) => {
    setElapsed(0);
    setPausedAt(null);
    setIsPaused(false);
  }, []);
  
  return {
    timeRemaining,
    totalMs,
    isExpired,
    progress,
    formatted,
    isPaused,
    pause,
    resume,
    reset
  };
}
