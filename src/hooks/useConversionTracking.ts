'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UrgencyLevel } from '@/lib/urgency';

// Conversion event types
export type ConversionEventType = 
  | 'page_view'
  | 'countdown_view'
  | 'add_to_cart'
  | 'purchase_start'
  | 'purchase_complete'
  | 'countdown_cta_click'
  | 'scarcity_alert_dismissed'
  | 'upgrade_clicked'
  | 'bundle_add';

// Conversion tracking interface
export interface ConversionEvent {
  eventType: ConversionEventType;
  timestamp: Date;
  urgencyLevel?: UrgencyLevel;
  value?: number;
  metadata?: Record<string, unknown>;
}

// Conversion metrics
export interface ConversionMetrics {
  totalViews: number;
  viewsWithUrgency: number;
  ctrOnUrgency: number; // Click-through rate on urgency elements
  conversionRate: number;
  urgencyConversionRate: number;
  avgTimeToConversion: number; // in seconds
  bundleConversionRate: number;
  upgradeConversionRate: number;
  revenueImpact: number;
}

// A/B test configuration
export interface ABTestConfig {
  testId: string;
  variant: 'control' | 'treatment';
  startTime: Date;
  endTime?: Date;
}

export interface ABTestMetrics {
  control: ConversionMetrics;
  treatment: ConversionMetrics;
  improvement: number; // Percentage improvement
  significance: number; // Statistical significance
  sampleSize: number;
}

// Conversion tracking singleton for session
const conversionEvents: ConversionEvent[] = [];
const sessionStartTime = Date.now();

export function useConversionTracking() {
  const eventsRef = useRef(conversionEvents);
  
  // Track an event
  const trackEvent = useCallback((
    eventType: ConversionEventType,
    options: {
      urgencyLevel?: UrgencyLevel;
      value?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ) => {
    const event: ConversionEvent = {
      eventType,
      timestamp: new Date(),
      ...options
    };
    
    eventsRef.current.push(event);
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Conversion] Tracked:', event);
    }
    
    // In production, send to analytics
    // sendToAnalytics(event);
    
    return event;
  }, []);
  
  // Track page view with urgency context
  const trackPageView = useCallback((urgencyLevel?: UrgencyLevel) => {
    return trackEvent('page_view', { urgencyLevel });
  }, [trackEvent]);
  
  // Track countdown timer view
  const trackCountdownView = useCallback((urgencyLevel: UrgencyLevel) => {
    return trackEvent('countdown_view', { urgencyLevel });
  }, [trackEvent]);
  
  // Track CTA click on urgency element
  const trackCtaClick = useCallback((urgencyLevel: UrgencyLevel) => {
    return trackEvent('countdown_cta_click', { urgencyLevel });
  }, [trackEvent]);
  
  // Track purchase completion
  const trackPurchase = useCallback((value: number, metadata?: Record<string, unknown>) => {
    return trackEvent('purchase_complete', { value, metadata });
  }, [trackEvent]);
  
  // Track upgrade click
  const trackUpgrade = useCallback((targetTier: string) => {
    return trackEvent('upgrade_clicked', { metadata: { targetTier } });
  }, [trackEvent]);
  
  // Track bundle add
  const trackBundleAdd = useCallback((bundleId: string, value: number) => {
    return trackEvent('bundle_add', { value, metadata: { bundleId } });
  }, [trackEvent]);
  
  // Calculate conversion metrics
  const getMetrics = useCallback((): ConversionMetrics => {
    const events = eventsRef.current;
    
    const totalViews = events.filter(e => e.eventType === 'page_view').length;
    const viewsWithUrgency = events.filter(
      e => e.eventType === 'page_view' && e.urgencyLevel
    ).length;
    const ctaClicks = events.filter(e => e.eventType === 'countdown_cta_click').length;
    const purchases = events.filter(e => e.eventType === 'purchase_complete');
    const upgrades = events.filter(e => e.eventType === 'upgrade_clicked');
    const bundleAdds = events.filter(e => e.eventType === 'bundle_add');
    
    // Calculate average time to conversion
    let avgTimeToConversion = 0;
    const conversionTimes: number[] = [];
    
    for (const purchase of purchases) {
      const viewEvents = events.filter(
        e => e.eventType === 'page_view' && e.timestamp < purchase.timestamp
      );
      if (viewEvents.length > 0) {
        const lastView = viewEvents[viewEvents.length - 1];
        conversionTimes.push(
          purchase.timestamp.getTime() - lastView.timestamp.getTime()
        );
      }
    }
    
    if (conversionTimes.length > 0) {
      avgTimeToConversion = 
        conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length / 1000;
    }
    
    // Calculate revenue impact (simplified)
    const revenueImpact = purchases.reduce((sum, p) => sum + (p.value || 0), 0);
    
    return {
      totalViews,
      viewsWithUrgency,
      ctrOnUrgency: totalViews > 0 ? (ctaClicks / totalViews) * 100 : 0,
      conversionRate: totalViews > 0 ? (purchases.length / totalViews) * 100 : 0,
      urgencyConversionRate: viewsWithUrgency > 0 
        ? (purchases.length / viewsWithUrgency) * 100 
        : 0,
      avgTimeToConversion,
      bundleConversionRate: totalViews > 0 
        ? (bundleAdds.length / totalViews) * 100 
        : 0,
      upgradeConversionRate: totalViews > 0 
        ? (upgrades.length / totalViews) * 100 
        : 0,
      revenueImpact
    };
  }, []);
  
  // Reset tracking for new session
  const resetTracking = useCallback(() => {
    eventsRef.current = [];
  }, []);
  
  // Get events for analysis
  const getEvents = useCallback(() => {
    return [...eventsRef.current];
  }, []);
  
  return {
    trackEvent,
    trackPageView,
    trackCountdownView,
    trackCtaClick,
    trackPurchase,
    trackUpgrade,
    trackBundleAdd,
    getMetrics,
    resetTracking,
    getEvents
  };
}

// Hook for A/B testing urgency elements
export function useABTesting(testConfig: ABTestConfig) {
  const [variant, setVariant] = useState<ABTestConfig['variant']>(testConfig.variant);
  const [metrics, setMetrics] = useState<{
    control: ConversionMetrics | null;
    treatment: ConversionMetrics | null;
  }>({
    control: null,
    treatment: null
  });
  
  // In production, you'd randomize the variant assignment
  // For now, we use the passed variant
  useEffect(() => {
    // Check if test has ended
    if (testConfig.endTime && new Date() > testConfig.endTime) {
      // Test ended, calculate final results
      return;
    }
  }, [testConfig]);
  
  // Track which variant was shown
  const trackVariantExposure = useCallback(() => {
    // In production, send to analytics
    console.log(`[A/B Test ${testConfig.testId}] Exposed to variant: ${variant}`);
  }, [testConfig.testId, variant]);
  
  // Get metrics for comparison
  const getComparison = useCallback((): ABTestMetrics | null => {
    if (!metrics.control || !metrics.treatment) {
      return null;
    }
    
    const control = metrics.control;
    const treatment = metrics.treatment;
    
    const improvement = control.conversionRate > 0
      ? ((treatment.conversionRate - control.conversionRate) / control.conversionRate) * 100
      : 0;
    
    // Simplified statistical significance (would use proper stats in production)
    const sampleSize = control.totalViews + treatment.totalViews;
    const significance = sampleSize > 100 ? 0.95 : 0; // Placeholder
    
    return {
      control,
      treatment,
      improvement,
      significance,
      sampleSize
    };
  }, [metrics]);
  
  return {
    variant,
    setVariant,
    trackVariantExposure,
    getComparison
  };
}

// Hook for tracking urgency impact on conversions
export function useUrgencyImpact() {
  const tracking = useConversionTracking();
  const [impactData, setImpactData] = useState<{
    withUrgency: ConversionMetrics;
    withoutUrgency: ConversionMetrics;
    uplift: number;
  } | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = tracking.getMetrics();
      
      // Separate metrics by urgency context
      const events = tracking.getEvents();
      
      const withUrgency: ConversionMetrics = {
        totalViews: 0,
        viewsWithUrgency: 0,
        ctrOnUrgency: 0,
        conversionRate: 0,
        urgencyConversionRate: 0,
        avgTimeToConversion: 0,
        bundleConversionRate: 0,
        upgradeConversionRate: 0,
        revenueImpact: 0
      };
      
      const withoutUrgency: ConversionMetrics = { ...withUrgency };
      
      // Calculate based on events
      const urgencyEvents = events.filter(
        e => e.eventType === 'page_view' && e.urgencyLevel
      );
      const nonUrgencyEvents = events.filter(
        e => e.eventType === 'page_view' && !e.urgencyLevel
      );
      
      // Simplified calculation
      withUrgency.totalViews = urgencyEvents.length;
      withoutUrgency.totalViews = nonUrgencyEvents.length;
      
      const urgencyPurchases = events.filter(
        e => e.eventType === 'purchase_complete' && 
             urgencyEvents.some(ue => ue.timestamp < e.timestamp)
      );
      
      const nonUrgencyPurchases = events.filter(
        e => e.eventType === 'purchase_complete' && 
             nonUrgencyEvents.some(ne => ne.timestamp < e.timestamp)
      );
      
      withUrgency.conversionRate = withUrgency.totalViews > 0
        ? (urgencyPurchases.length / withUrgency.totalViews) * 100
        : 0;
      
      withoutUrgency.conversionRate = withoutUrgency.totalViews > 0
        ? (nonUrgencyPurchases.length / withoutUrgency.totalViews) * 100
        : 0;
      
      const uplift = withoutUrgency.conversionRate > 0
        ? ((withUrgency.conversionRate - withoutUrgency.conversionRate) 
           / withoutUrgency.conversionRate) * 100
        : 0;
      
      setImpactData({ withUrgency, withoutUrgency, uplift });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [tracking]);
  
  return {
    ...tracking,
    impactData
  };
}
