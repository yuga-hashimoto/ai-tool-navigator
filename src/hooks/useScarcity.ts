'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ScarcityConfig, 
  UrgencyMetrics, 
  UrgencyLevel,
  calculateUrgencyMetrics,
  getStockUrgencyMessage,
  getUrgencyBadgeConfig,
  calculateDynamicDiscount
} from '@/lib/urgency';

interface UseScarcityOptions {
  maxStock: number;
  refreshIntervalMs?: number;
  onCriticalLevel?: () => void;
  onSoldOut?: () => void;
}

interface UseScarcityReturn {
  stock: number;
  metrics: UrgencyMetrics;
  stockMessage: string;
  badgeConfig: ReturnType<typeof getUrgencyBadgeConfig>;
  dynamicDiscount: number;
  isLowStock: boolean;
  isSoldOut: boolean;
  decrement: (amount?: number) => void;
  refresh: () => Promise<void>;
}

// Mock function to simulate stock changes (replace with real API call)
async function fetchCurrentStock(productId: string): Promise<number> {
  // In production, this would fetch from your API
  // For demo purposes, we return a random value
  return Math.floor(Math.random() * 100);
}

export function useProductScarcity(
  productId: string,
  initialStock: number,
  options: UseScarcityOptions = { maxStock: 100 }
): UseScarcityReturn {
  const { 
    maxStock, 
    refreshIntervalMs = 30000,
    onCriticalLevel,
    onSoldOut 
  } = options;
  
  const [stock, setStock] = useState<number>(initialStock);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(24 * 60 * 60 * 1000); // Default 24 hours
  
  // Calculate metrics
  const metrics = useMemo<UrgencyMetrics>(() => 
    calculateUrgencyMetrics({
      stockLevel: stock,
      maxStock,
      timeRemainingMs,
      totalDurationMs: 24 * 60 * 60 * 1000
    }),
    [stock, maxStock, timeRemainingMs]
  );
  
  // Generate stock message
  const stockMessage = useMemo<string>(() => 
    getStockUrgencyMessage(stock, maxStock),
    [stock, maxStock]
  );
  
  // Generate badge config
  const badgeConfig = useMemo<ReturnType<typeof getUrgencyBadgeConfig>>(() => 
    getUrgencyBadgeConfig(metrics),
    [metrics]
  );
  
  // Calculate dynamic discount
  const dynamicDiscount = useMemo<number>(() => 
    calculateDynamicDiscount(10, metrics.urgencyLevel, metrics.stockPercentage),
    [metrics]
  );
  
  // Check low stock and sold out states
  const isLowStock = stock <= maxStock * 0.2;
  const isSoldOut = stock <= 0;
  
  // Decrement stock (e.g., when someone makes a purchase)
  const decrement = useCallback((amount = 1) => {
    setStock(prev => {
      const newStock = Math.max(0, prev - amount);
      if (newStock <= 0) {
        onSoldOut?.();
      } else if (newStock <= maxStock * 0.1) {
        onCriticalLevel?.();
      }
      return newStock;
    });
  }, [maxStock, onCriticalLevel, onSoldOut]);
  
  // Refresh stock from server
  const refresh = useCallback(async () => {
    const newStock = await fetchCurrentStock(productId);
    setStock(newStock);
    
    if (newStock <= 0) {
      onSoldOut?.();
    }
  }, [productId, onSoldOut]);
  
  // Auto-refresh stock
  useEffect(() => {
    const interval = setInterval(refresh, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refresh, refreshIntervalMs]);
  
  // Trigger callbacks when urgency level changes
  useEffect(() => {
    if (metrics.urgencyLevel === 'critical' && stock > 0) {
      onCriticalLevel?.();
    }
    if (isSoldOut) {
      onSoldOut?.();
    }
  }, [metrics.urgencyLevel, stock, isSoldOut, onCriticalLevel, onSoldOut]);
  
  return {
    stock,
    metrics,
    stockMessage,
    badgeConfig,
    dynamicDiscount,
    isLowStock,
    isSoldOut,
    decrement,
    refresh
  };
}

// Hook for countdown + stock scarcity combined
interface UseUrgencyDealOptions {
  initialStock: number;
  maxStock: number;
  durationMs: number;
  dealId: string;
  onExpired?: () => void;
  onSoldOut?: () => void;
}

interface UseUrgencyDealReturn extends UseScarcityReturn {
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  totalMs: number;
  isExpired: boolean;
  progress: number; // Time progress 0-100
  urgencyLevel: UrgencyLevel;
  purchase: (quantity?: number) => Promise<boolean>;
}

export function useUrgencyDeal(
  options: UseUrgencyDealOptions
): UseUrgencyDealReturn {
  const {
    initialStock,
    maxStock,
    durationMs,
    dealId,
    onExpired,
    onSoldOut
  } = options;
  
  // Stock management
  const [stock, setStock] = useState<number>(initialStock);
  
  // Time management
  const [startTime] = useState<number>(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  
  const timeRemainingMs = Math.max(0, durationMs - elapsedMs);
  const totalMs = durationMs;
  const progress = Math.min(100, (elapsedMs / durationMs) * 100);
  
  // Calculate time remaining
  const timeRemaining = {
    days: Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeRemainingMs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((timeRemainingMs / (1000 * 60)) % 60),
    seconds: Math.floor((timeRemainingMs / 1000) % 60)
  };
  
  // Calculate metrics
  const metrics = useMemo<UrgencyMetrics>(() => 
    calculateUrgencyMetrics({
      stockLevel: stock,
      maxStock,
      timeRemainingMs,
      totalDurationMs: durationMs
    }),
    [stock, maxStock, timeRemainingMs, durationMs]
  );
  
  const urgencyLevel = metrics.urgencyLevel;
  
  const stockMessage = useMemo<string>(() => 
    getStockUrgencyMessage(stock, maxStock),
    [stock, maxStock]
  );
  
  const badgeConfig = useMemo<ReturnType<typeof getUrgencyBadgeConfig>>(() => 
    getUrgencyBadgeConfig(metrics),
    [metrics]
  );
  
  const dynamicDiscount = useMemo<number>(() => 
    calculateDynamicDiscount(10, metrics.urgencyLevel, metrics.stockPercentage),
    [metrics]
  );
  
  const isLowStock = stock <= maxStock * 0.2;
  const isSoldOut = stock <= 0;
  
  // Timer effect
  useEffect(() => {
    if (isExpired || isSoldOut) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      
      if (elapsed >= durationMs) {
        setIsExpired(true);
        onExpired?.();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, durationMs, isExpired, isSoldOut, onExpired]);
  
  // Purchase function
  const purchase = useCallback(async (quantity = 1): Promise<boolean> => {
    if (isExpired || isSoldOut || stock < quantity) {
      return false;
    }
    
    // Simulate purchase
    setStock(prev => {
      const newStock = Math.max(0, prev - quantity);
      if (newStock === 0) {
        onSoldOut?.();
      }
      return newStock;
    });
    
    return true;
  }, [isExpired, isSoldOut, stock, onSoldOut]);
  
  // Decrement helper
  const decrement = useCallback((amount = 1) => {
    setStock(prev => Math.max(0, prev - amount));
  }, []);
  
  // Refresh helper
  const refresh = useCallback(async () => {
    // In production, fetch from API
    const newStock = await fetchCurrentStock(dealId);
    setStock(newStock);
  }, [dealId]);
  
  return {
    stock,
    metrics,
    stockMessage,
    badgeConfig,
    dynamicDiscount,
    isLowStock,
    isSoldOut,
    decrement,
    refresh,
    timeRemaining,
    totalMs,
    isExpired,
    progress,
    urgencyLevel,
    purchase
  };
}
