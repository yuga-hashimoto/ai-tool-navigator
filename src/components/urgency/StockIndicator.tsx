'use client';

import React, { useMemo } from 'react';
import { Package, AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductScarcity } from '@/hooks/useScarcity';

interface StockIndicatorProps {
  productId: string;
  initialStock: number;
  maxStock?: number;
  className?: string;
  variant?: 'default' | 'minimal' | 'progress' | 'badge';
  showDynamicDiscount?: boolean;
  onLowStock?: () => void;
  onSoldOut?: () => void;
}

export function StockIndicator({
  productId,
  initialStock,
  maxStock = 100,
  className,
  variant = 'default',
  showDynamicDiscount = false,
  onLowStock,
  onSoldOut
}: StockIndicatorProps) {
  const {
    stock,
    metrics,
    stockMessage,
    badgeConfig,
    dynamicDiscount,
    isLowStock,
    isSoldOut
  } = useProductScarcity(productId, initialStock, {
    maxStock,
    onCriticalLevel: onLowStock,
    onSoldOut
  });
  
  if (variant === 'badge') {
    return (
      <StockBadge
        stock={stock}
        maxStock={maxStock}
        message={stockMessage}
        badgeConfig={badgeConfig}
        className={className}
      />
    );
  }
  
  if (variant === 'progress') {
    return (
      <StockProgress
        stock={stock}
        maxStock={maxStock}
        metrics={metrics}
        className={className}
      />
    );
  }
  
  if (variant === 'minimal') {
    return (
      <MinimalStock
        stock={stock}
        isLowStock={isLowStock}
        className={className}
      />
    );
  }
  
  return (
    <DefaultStock
      stock={stock}
      maxStock={maxStock}
      stockMessage={stockMessage}
      metrics={metrics}
      badgeConfig={badgeConfig}
      dynamicDiscount={dynamicDiscount}
      showDynamicDiscount={showDynamicDiscount}
      isLowStock={isLowStock}
      isSoldOut={isSoldOut}
      className={className}
    />
  );
}

interface DefaultStockProps {
  stock: number;
  maxStock: number;
  stockMessage: string;
  metrics: ReturnType<typeof useProductScarcity>['metrics'];
  badgeConfig: ReturnType<typeof useProductScarcity>['badgeConfig'];
  dynamicDiscount: number;
  showDynamicDiscount: boolean;
  isLowStock: boolean;
  isSoldOut: boolean;
  className?: string;
}

function DefaultStock({
  stock,
  maxStock,
  stockMessage,
  metrics,
  badgeConfig,
  dynamicDiscount,
  showDynamicDiscount,
  isLowStock,
  isSoldOut,
  className
}: DefaultStockProps) {
  const stockPercentage = (stock / maxStock) * 100;
  
  if (isSoldOut) {
    return (
      <div className={cn(
        'flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200',
        className
      )}>
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-red-500" />
          <span className="font-medium text-red-700">Sold Out</span>
        </div>
        <span className="text-sm text-red-600">Check back later</span>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          badgeConfig.className
        )}>
          {badgeConfig.text}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className={cn(
            'w-5 h-5',
            isLowStock ? 'text-orange-500' : 'text-gray-600'
          )} />
          <span className={cn(
            'font-semibold',
            isLowStock ? 'text-orange-700' : 'text-gray-700'
          )}>
            {stockMessage}
          </span>
        </div>
        
        {showDynamicDiscount && dynamicDiscount > 0 && (
          <DiscountBadge discount={dynamicDiscount} />
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{stock} in stock</span>
          <span>{stockPercentage.toFixed(0)}% remaining</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              metrics.urgencyLevel === 'critical' 
                ? 'bg-red-500' 
                : metrics.urgencyLevel === 'high'
                ? 'bg-orange-500'
                : 'bg-green-500'
            )}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface StockProgressProps {
  stock: number;
  maxStock: number;
  metrics: ReturnType<typeof useProductScarcity>['metrics'];
  className?: string;
}

function StockProgress({ stock, maxStock, metrics, className }: StockProgressProps) {
  const stockPercentage = (stock / maxStock) * 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Stock Level</span>
        <span className={cn(
          metrics.urgencyLevel === 'critical' ? 'text-red-600' :
          metrics.urgencyLevel === 'high' ? 'text-orange-600' :
          'text-green-600'
        )}>
          {stock} / {maxStock}
        </span>
      </div>
      
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute h-full transition-all duration-500',
            metrics.urgencyLevel === 'critical' 
              ? 'bg-red-500' 
              : metrics.urgencyLevel === 'high'
              ? 'bg-orange-500'
              : 'bg-green-500'
          )}
          style={{ width: `${stockPercentage}%` }}
        />
      </div>
    </div>
  );
}

interface MinimalStockProps {
  stock: number;
  isLowStock: boolean;
  className?: string;
}

function MinimalStock({ stock, isLowStock, className }: MinimalStockProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1',
      isLowStock ? 'text-orange-600 font-medium' : 'text-gray-600',
      className
    )}>
      <Package className="w-4 h-4" />
      {stock} left
    </span>
  );
}

interface StockBadgeProps {
  stock: number;
  maxStock: number;
  message: string;
  badgeConfig: ReturnType<typeof useProductScarcity>['badgeConfig'];
  className?: string;
}

function StockBadge({ stock, maxStock, message, badgeConfig, className }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500',
        className
      )}>
        <CheckCircle className="w-3 h-3" />
        Sold Out
      </span>
    );
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      badgeConfig.className,
      className
    )}>
      <TrendingDown className="w-3 h-3" />
      {message}
    </span>
  );
}

interface DiscountBadgeProps {
  discount: number;
}

function DiscountBadge({ discount }: DiscountBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-bold">
      -{discount}% OFF
    </span>
  );
}

export function CompactStockIndicator({
  stock,
  maxStock,
  className
}: {
  stock: number;
  maxStock: number;
  className?: string;
}) {
  const percentage = (stock / maxStock) * 100;
  
  if (percentage <= 10) {
    return (
      <span className={cn('text-red-600 font-bold text-sm flex items-center gap-1', className)}>
        <AlertTriangle className="w-3 h-3" />
        Only {stock} left!
      </span>
    );
  }
  
  if (percentage <= 25) {
    return (
      <span className={cn('text-orange-600 font-medium text-sm', className)}>
        {stock} in stock
      </span>
    );
  }
  
  return (
    <span className={cn('text-green-600 text-sm', className)}>
      In Stock
    </span>
  );
}
