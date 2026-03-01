'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { trackExitIntentEvent } from '@/lib/analytics';

export interface ExitIntentMetrics {
  totalExits: number;
  totalTriggers: number;
  totalConversions: number;
  triggerRate: number;
  conversionRate: number;
  averageTimeToExit: number;
  variantBreakdown: Record<string, MetricVariant>;
}

export interface MetricVariant {
  impressions: number;
  conversions: number;
  triggerRate: number;
  conversionRate: number;
  avgTimeOnPage: number;
}

interface SessionTrackingState {
  sessionStartTime: number;
  pageEnterTime: number;
  exitIntentTriggered: boolean;
  exitsCount: number;
  triggers: number;
  conversions: number;
  variantAssignments: Record<string, string>;
}

export function useExitIntentMetrics(): {
  metrics: ExitIntentMetrics;
  trackExit: () => void;
  trackTrigger: (variant: string) => void;
  trackConversion: (variant: string) => void;
  trackTimeOnPage: () => number;
  resetMetrics: () => void;
} {
  const [metrics, setMetrics] = useState<ExitIntentMetrics>({
    totalExits: 0,
    totalTriggers: 0,
    totalConversions: 0,
    triggerRate: 0,
    conversionRate: 0,
    averageTimeToExit: 0,
    variantBreakdown: {},
  });

  const stateRef = useRef<SessionTrackingState>({
    sessionStartTime: Date.now(),
    pageEnterTime: Date.now(),
    exitIntentTriggered: false,
    exitsCount: 0,
    triggers: 0,
    conversions: 0,
    variantAssignments: {},
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = sessionStorage.getItem('exit_intent_metrics');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMetrics(parsed);
        stateRef.current = { ...stateRef.current, ...parsed };
      } catch (e) {
        console.warn('Failed to parse exit intent metrics:', e);
      }
    }

    stateRef.current.pageEnterTime = Date.now();

    const handleBeforeUnload = () => {
      sessionStorage.setItem('exit_intent_metrics', JSON.stringify(stateRef.current));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  const trackExit = useCallback(() => {
    stateRef.current.exitsCount += 1;
    const timeOnPage = Date.now() - stateRef.current.pageEnterTime;
    
    setMetrics(prev => ({
      ...prev,
      totalExits: prev.totalExits + 1,
      averageTimeToExit: calculateAverageTime(prev.averageTimeToExit, prev.totalExits, timeOnPage),
    }));

    trackExitIntentEvent('closed', {
      time_on_page: timeOnPage,
      total_exits: stateRef.current.exitsCount,
    });

    saveMetrics();
  }, []);

  const trackTrigger = useCallback((variant: string) => {
    stateRef.current.triggers += 1;
    stateRef.current.exitIntentTriggered = true;
    
    if (!stateRef.current.variantAssignments['last_trigger']) {
      stateRef.current.variantAssignments['last_trigger'] = variant;
    }

    const timeOnPage = Date.now() - stateRef.current.pageEnterTime;

    setMetrics(prev => {
      const variantMetrics = prev.variantBreakdown[variant] || {
        impressions: 0,
        conversions: 0,
        triggerRate: 0,
        conversionRate: 0,
        avgTimeOnPage: 0,
      };

      return {
        ...prev,
        totalTriggers: prev.totalTriggers + 1,
        triggerRate: (prev.totalExits > 0) 
          ? (prev.totalTriggers + 1) / prev.totalExits 
          : 0,
        variantBreakdown: {
          ...prev.variantBreakdown,
          [variant]: {
            ...variantMetrics,
            impressions: variantMetrics.impressions + 1,
            avgTimeOnPage: calculateAverageTime(
              variantMetrics.avgTimeOnPage,
              variantMetrics.impressions,
              timeOnPage
            ),
          },
        },
      };
    });

    trackExitIntentEvent('triggered', {
      variant,
      time_on_page: timeOnPage,
    });

    saveMetrics();
  }, []);

  const trackConversion = useCallback((variant: string) => {
    stateRef.current.conversions += 1;

    setMetrics(prev => {
      const variantMetrics = prev.variantBreakdown[variant] || {
        impressions: 0,
        conversions: 0,
        triggerRate: 0,
        conversionRate: 0,
        avgTimeOnPage: 0,
      };

      const newConversionRate = variantMetrics.impressions > 0
        ? (variantMetrics.conversions + 1) / variantMetrics.impressions
        : 0;

      return {
        ...prev,
        totalConversions: prev.totalConversions + 1,
        conversionRate: prev.totalTriggers > 0
          ? (prev.totalConversions + 1) / prev.totalTriggers
          : 0,
        variantBreakdown: {
          ...prev.variantBreakdown,
          [variant]: {
            ...variantMetrics,
            conversions: variantMetrics.conversions + 1,
            conversionRate: newConversionRate,
          },
        },
      };
    });

    trackExitIntentEvent('conversion', {
      variant,
      conversion_rate: metrics.conversionRate,
    });

    saveMetrics();
  }, [metrics.conversionRate]);

  const trackTimeOnPage = useCallback((): number => {
    return Date.now() - stateRef.current.pageEnterTime;
  }, []);

  const resetMetrics = useCallback(() => {
    stateRef.current = {
      sessionStartTime: Date.now(),
      pageEnterTime: Date.now(),
      exitIntentTriggered: false,
      exitsCount: 0,
      triggers: 0,
      conversions: 0,
      variantAssignments: {},
    };
    
    setMetrics({
      totalExits: 0,
      totalTriggers: 0,
      totalConversions: 0,
      triggerRate: 0,
      conversionRate: 0,
      averageTimeToExit: 0,
      variantBreakdown: {},
    });

    sessionStorage.removeItem('exit_intent_metrics');
  }, []);

  const saveMetrics = useCallback(() => {
    sessionStorage.setItem('exit_intent_metrics', JSON.stringify(stateRef.current));
  }, []);

  return {
    metrics,
    trackExit,
    trackTrigger,
    trackConversion,
    trackTimeOnPage,
    resetMetrics,
  };
}

function calculateAverageTime(currentAvg: number, count: number, newValue: number): number {
  return ((currentAvg * count) + newValue) / (count + 1);
}

export function useExitRateTracker(
  options: {
    enabled?: boolean;
    sampleRate?: number;
    onExitRateChange?: (rate: number) => void;
  } = {}
): { exitRate: number; isTracking: boolean } {
  const { enabled = true, sampleRate = 0.1, onExitRateChange } = options;
  const [exitRate, setExitRate] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const pageViewsRef = useRef(0);
  const exitsRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setIsTracking(false);
      return;
    }

    setIsTracking(true);
    pageViewsRef.current = 0;
    exitsRef.current = 0;

    if (Math.random() > sampleRate) {
      setIsTracking(false);
      return;
    }

    const handleBeforeUnload = () => {
      exitsRef.current += 1;
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          event: 'early_exit',
          page_views: pageViewsRef.current,
          exits: exitsRef.current,
          timestamp: Date.now(),
        });
        navigator.sendBeacon('/api/analytics/early-exit', data);
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        pageViewsRef.current += 1;
      }
    };

    const hasSeenPage = sessionStorage.getItem('exit_rate_tracked');
    if (!hasSeenPage) {
      pageViewsRef.current = 1;
      sessionStorage.setItem('exit_rate_tracked', 'true');
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    const calculateExitRate = () => {
      if (pageViewsRef.current > 0) {
        const rate = exitsRef.current / pageViewsRef.current;
        setExitRate(rate);
        onExitRateChange?.(rate);
      }
    };

    const interval = setInterval(calculateExitRate, 5000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
      clearInterval(interval);
      calculateExitRate();
    };
  }, [enabled, sampleRate, onExitRateChange]);

  return { exitRate, isTracking };
}

export interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export function useFunnelTracking(
  funnelName: string,
  steps: string[]
): {
  currentStep: number;
  trackStep: (stepName?: string) => void;
  funnelData: FunnelStep[];
  resetFunnel: () => void;
} {
  const [currentStep, setCurrentStep] = useState(0);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>(
    steps.map(step => ({
      name: step,
      count: 0,
      conversionRate: 0,
      dropOffRate: 0,
    }))
  );

  const trackStep = useCallback((stepName?: string) => {
    const stepIndex = stepName ? steps.indexOf(stepName) : currentStep;
    
    if (stepIndex === -1 || stepIndex > currentStep) return;

    setFunnelData(prev => {
      const newData = [...prev];
      newData[stepIndex].count += 1;

      if (stepIndex > 0 && newData[stepIndex - 1].count > 0) {
        newData[stepIndex].conversionRate = 
          newData[stepIndex].count / newData[stepIndex - 1].count;
      }

      if (stepIndex > 0) {
        const completed = newData.slice(0, stepIndex + 1).reduce((sum, s) => sum + s.count, 0);
        const totalStarted = newData[0].count;
        newData[stepIndex].dropOffRate = 1 - (completed / totalStarted);
      }

      return newData;
    });

    if (stepIndex >= currentStep && stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  }, [currentStep, steps]);

  const resetFunnel = useCallback(() => {
    setCurrentStep(0);
    setFunnelData(steps.map(step => ({
      name: step,
      count: 0,
      conversionRate: 0,
      dropOffRate: 0,
    })));
  }, [steps]);

  return {
    currentStep,
    trackStep,
    funnelData,
    resetFunnel,
  };
}
