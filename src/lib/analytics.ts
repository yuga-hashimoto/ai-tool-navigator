// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GTag = (...args: any[]) => void;

declare global {
  interface Window {
    gtag?: GTag;
    _paq?: Array<Array<unknown>>;
  }
}

export const sendGAEvent = (eventName: string, params?: Record<string, string | number | boolean | null | undefined>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

// Exit Intent Event Tracking
export type ExitIntentEventType = 'triggered' | 'shown' | 'closed' | 'conversion' | 'error';

export interface ExitIntentEventParams {
  variant?: string;
  attempt_count?: number;
  source?: string;
  error?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track exit intent events for analytics
 * Sends events to GA4 and Matomo (if available)
 */
export function trackExitIntentEvent(
  eventType: ExitIntentEventType,
  params: ExitIntentEventParams = {}
): void {
  const eventName = `exit_intent_${eventType}`;
  
  // Send to GA4
  sendGAEvent(eventName, {
    ...params,
    timestamp: Date.now(),
  });

  // Send to Matomo if available
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['trackEvent', 'Exit Intent', eventType, params.variant || 'default']);
  }

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Exit Intent] ${eventType}:`, params);
  }
}

/**
 * Track A/B test variant assignments
 */
export function trackABTestVariant(testName: string, variant: string): void {
  sendGAEvent('ab_test_assignment', {
    test_name: testName,
    variant,
  });
}

/**
 * Track conversion rate metrics
 */
export function trackConversionRate(
  source: string,
  converted: boolean,
  value?: number
): void {
  sendGAEvent('conversion', {
    source,
    converted: converted.toString(),
    value: value || 0,
  });
}

/**
 * Track popup impression for conversion rate calculation
 */
export function trackPopupImpression(
  popupType: string,
  variant?: string
): void {
  sendGAEvent('popup_impression', {
    popup_type: popupType,
    variant: variant || 'default',
  });
}
