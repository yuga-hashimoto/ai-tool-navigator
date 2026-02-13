// =====================================================
// COUNTDOWN & SCARCITY UTILITIES
// =====================================================

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ScarcityConfig {
  stockLevel: number;
  maxStock: number;
  timeRemainingMs: number;
  totalDurationMs: number;
}

export interface UrgencyMetrics {
  urgencyLevel: UrgencyLevel;
  stockPercentage: number;
  timePercentage: number;
  scarcityScore: number; // 0-100
  recommendations: string[];
}

// Calculate urgency metrics based on stock and time
export function calculateUrgencyMetrics(config: ScarcityConfig): UrgencyMetrics {
  const stockPercentage = (config.stockLevel / config.maxStock) * 100;
  const timePercentage = Math.max(0, (config.timeRemainingMs / config.totalDurationMs) * 100);
  
  // Calculate scarcity score (weighted average)
  const scarcityScore = Math.min(100, (stockPercentage * 0.4) + (timePercentage * 0.6));
  
  // Determine urgency level
  let urgencyLevel: UrgencyLevel = 'low';
  if (scarcityScore >= 80 || stockPercentage <= 10 || timePercentage <= 10) {
    urgencyLevel = 'critical';
  } else if (scarcityScore >= 60 || stockPercentage <= 25 || timePercentage <= 25) {
    urgencyLevel = 'high';
  } else if (scarcityScore >= 40 || stockPercentage <= 50 || timePercentage <= 50) {
    urgencyLevel = 'medium';
  }
  
  // Generate recommendations based on urgency
  const recommendations: string[] = [];
  if (urgencyLevel === 'critical') {
    recommendations.push('Show "Selling Fast" badge');
    recommendations.push('Display countdown prominently');
    recommendations.push('Highlight limited stock');
  } else if (urgencyLevel === 'high') {
    recommendations.push('Show "Only X left" indicator');
    recommendations.push('Display time remaining');
    recommendations.push('Add urgency messaging');
  } else if (urgencyLevel === 'medium') {
    recommendations.push('Show "Limited Time" badge');
    recommendations.push('Display savings percentage');
  }
  
  return {
    urgencyLevel,
    stockPercentage,
    timePercentage,
    scarcityScore,
    recommendations
  };
}

// Stock urgency messages based on level
export function getStockUrgencyMessage(stock: number, maxStock: number): string {
  const percentage = (stock / maxStock) * 100;
  
  if (stock === 0) return 'Sold Out';
  if (percentage <= 5) return `Only ${stock} left!`;
  if (percentage <= 10) return `Hurry! Only ${stock} remaining`;
  if (percentage <= 20) return `${stock} left in stock`;
  if (percentage <= 50) return 'Selling quickly';
  return 'Limited stock available';
}

// Time urgency messages based on remaining time
export function getTimeUrgencyMessage(remainingMs: number): string {
  const hours = remainingMs / (1000 * 60 * 60);
  
  if (remainingMs <= 0) return 'Offer Expired';
  if (hours < 1) return 'Less than 1 hour left!';
  if (hours < 6) return `${Math.ceil(hours)} hours left`;
  if (hours < 24) return `${Math.ceil(hours / 24)} days left`;
  return 'Offer ends soon';
}

// Calculate dynamic discount based on urgency
export function calculateDynamicDiscount(
  baseDiscount: number,
  urgencyLevel: UrgencyLevel,
  stockPercentage: number
): number {
  let bonusDiscount = 0;
  
  // Urgency-based bonus
  switch (urgencyLevel) {
    case 'critical':
      bonusDiscount += 10;
      break;
    case 'high':
      bonusDiscount += 5;
      break;
    case 'medium':
      bonusDiscount += 2;
      break;
  }
  
  // Stock-based bonus
  if (stockPercentage <= 10) {
    bonusDiscount += 5;
  } else if (stockPercentage <= 25) {
    bonusDiscount += 3;
  }
  
  return Math.min(baseDiscount + bonusDiscount, 50); // Cap at 50%
}

// Check if offer has expired
export function isOfferExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
}

// Calculate time until expiration
export function getTimeUntilExpiration(expirationDate: Date): number {
  return Math.max(0, expirationDate.getTime() - new Date().getTime());
}

// Format time remaining for display
export function formatTimeRemaining(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds };
}

// Generate urgency badge configuration
export interface UrgencyBadgeConfig {
  text: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
  pulse: boolean;
  icon?: string;
}

export function getUrgencyBadgeConfig(metrics: UrgencyMetrics): UrgencyBadgeConfig {
  switch (metrics.urgencyLevel) {
    case 'critical':
      return {
        text: '🔥 Selling Fast',
        variant: 'danger',
        pulse: true,
        icon: 'fire'
      };
    case 'high':
      return {
        text: '⚡ Limited Stock',
        variant: 'warning',
        pulse: true,
        icon: 'lightning'
      };
    case 'medium':
      return {
        text: '⏰ Limited Time',
        variant: 'info',
        pulse: false,
        icon: 'clock'
      };
    default:
      return {
        text: '✨ Best Value',
        variant: 'success',
        pulse: false,
        icon: 'star'
      };
  }
}
