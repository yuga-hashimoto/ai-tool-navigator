'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useExitIntentABTest } from '@/lib/ab-testing';
import { trackExitIntentEvent } from '@/lib/analytics';
import { getGeoLocation, type GeoLocation } from '@/lib/geo-targeting';

// Exit intent trigger delay in milliseconds
const EXIT_INTENT_TRIGGER_DELAY = 300;

// How often to check for exit intent (debounce)
const EXIT_INTENT_CHECK_INTERVAL = 100;

// Maximum number of times to show the modal per session
const MAX_SESSIONS_SHOWS = 3;

// Days to wait before showing again after closing
const CLOSE_COOLDOWN_DAYS = 7;

// Viewport threshold for mobile (pixels from top)
const MOBILE_VIEWPORT_THRESHOLD = 100;

// Session storage key for exit intent state
const EXIT_INTENT_SESSION_KEY = 'exit_intent_state';

/**
 * Exit intent state interface
 */
interface ExitIntentState {
  hasTriggered: boolean;
  attemptCount: number;
  lastShownAt: number | null;
  isSubscribed: boolean;
}

/**
 * Geo-targeted offer configuration
 */
export interface GeoOfferConfig {
  countryCodes: string[];
  headline: string;
  subtitle: string;
  cta: string;
  discountCode?: string;
  discountPercent?: number;
}

/**
 * Default offers by region
 */
export const GEO_OFFERS: Record<string, GeoOfferConfig> = {
  NA: {
    countryCodes: ['US', 'CA', 'MX'],
    headline: 'Get 20% Off Your First Month',
    subtitle: 'Join 50,000+ developers using our AI tools',
    cta: 'Claim My Discount',
    discountCode: 'US20OFF',
    discountPercent: 20,
  },
  EU: {
    countryCodes: ['UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI', 'BE', 'AT', 'CH', 'PL', 'CZ', 'RO', 'HU', 'PT', 'GR', 'IE'],
    headline: 'Special Launch Offer - 25% Off',
    subtitle: 'Be among the first to access premium AI tools',
    cta: 'Get Started Now',
    discountCode: 'EU25LAUNCH',
    discountPercent: 25,
  },
  APAC: {
    countryCodes: ['JP', 'KR', 'AU', 'NZ', 'SG', 'HK', 'TW', 'IN', 'TH', 'MY', 'ID', 'PH', 'VN'],
    headline: 'Early Bird Special - 30% Off',
    subtitle: 'Limited time offer for new subscribers',
    cta: 'Start Free Trial',
    discountCode: 'APAC30',
    discountPercent: 30,
  },
  DEFAULT: {
    countryCodes: [],
    headline: 'Unlock Premium Features Today',
    subtitle: 'Join our community of AI enthusiasts',
    cta: 'Subscribe Now',
  },
};

export const DEFAULT_OFFERS = {
  default: {
    headline: 'Unlock Premium AI Tools',
    subtitle: 'Get exclusive access to our curated tool collection',
    cta: 'Subscribe Free',
  },
  urgent: {
    headline: 'Wait! Don\'t Miss Out',
    subtitle: 'Your exclusive offer expires in 24 hours',
    cta: 'Claim Now',
  },
  bonus: {
    headline: 'Bonus: Free Premium Access',
    subtitle: 'Subscribe today and get 1 month free premium',
    cta: 'Get My Bonus',
  },
};

/**
 * Hook for detecting viewport exit intent
 */
export function useViewportExitDetection(
  enabled: boolean = true,
  onExitIntent: () => void
): { shouldTrack: boolean; exitDetected: boolean } {
  const [shouldTrack, setShouldTrack] = useState(false);
  const [exitDetected, setExitDetected] = useState(false);
  const lastY = useRef<number>(0);
  const hasTriggered = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || hasTriggered.current) {
      setShouldTrack(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastY.current = e.clientY;
      setShouldTrack(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered.current) {
        hasTriggered.current = true;
        setExitDetected(true);
        onExitIntent();
        
        setTimeout(() => {
          hasTriggered.current = false;
        }, EXIT_INTENT_TRIGGER_DELAY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, onExitIntent]);

  return { shouldTrack, exitDetected };
}

/**
 * Enhanced hook for exit intent modal with geo-targeting and A/B testing
 */
export function useExitIntentModal(
  options: {
    enabled?: boolean;
    delay?: number;
    maxShows?: number;
    cooldownDays?: number;
  } = {}
): {
  isVisible: boolean;
  variant: 'default' | 'urgent' | 'bonus';
  geoOffer: GeoOfferConfig | null;
  showModal: () => void;
  hideModal: () => void;
  handleConversion: (email: string) => Promise<void>;
  handleClose: () => void;
  state: ExitIntentState;
} {
  const {
    enabled = true,
    delay = EXIT_INTENT_TRIGGER_DELAY,
    maxShows = MAX_SESSIONS_SHOWS,
    cooldownDays = CLOSE_COOLDOWN_DAYS,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [isClient, setIsClient] = useState(false);
  const stateRef = useRef<ExitIntentState>({
    hasTriggered: false,
    attemptCount: 0,
    lastShownAt: null,
    isSubscribed: false,
  });

  const { variant, isLoading: isAbTestLoading } = useExitIntentABTest();

  useEffect(() => {
    setIsClient(true);
    
    const savedState = sessionStorage.getItem(EXIT_INTENT_SESSION_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        stateRef.current = { ...stateRef.current, ...parsed };
      } catch (e) {
        console.error('Failed to parse exit intent state:', e);
      }
    }

    const isSubscribed = localStorage.getItem('newsletter_subscribed') === 'true';
    stateRef.current.isSubscribed = isSubscribed;

    getGeoLocation().then(setGeoLocation).catch(() => {
      console.debug('Could not determine geo location');
    });
  }, []);

  const getGeoOffer = useCallback((): GeoOfferConfig | null => {
    if (!geoLocation) return null;

    for (const [region, offer] of Object.entries(GEO_OFFERS)) {
      if (region === 'DEFAULT') continue;
      if (offer.countryCodes.includes(geoLocation.countryCode)) {
        return offer;
      }
    }

    return GEO_OFFERS.DEFAULT;
  }, [geoLocation]);

  const shouldShowModal = useCallback((): boolean => {
    if (!enabled || !isClient) return false;
    if (stateRef.current.isSubscribed) return false;
    if (stateRef.current.attemptCount >= maxShows) return false;

    if (stateRef.current.lastShownAt) {
      const lastShown = new Date(stateRef.current.lastShownAt);
      const now = new Date();
      const diffDays = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays < cooldownDays) return false;
    }

    return true;
  }, [enabled, isClient, maxShows, cooldownDays]);

  const handleExitIntent = useCallback(() => {
    if (!shouldShowModal()) return;

    setTimeout(() => {
      if (shouldShowModal()) {
        setIsVisible(true);
        stateRef.current.hasTriggered = true;
        stateRef.current.attemptCount += 1;
        stateRef.current.lastShownAt = Date.now();
        
        sessionStorage.setItem(
          EXIT_INTENT_SESSION_KEY,
          JSON.stringify(stateRef.current)
        );

        trackExitIntentEvent('triggered', {
          variant,
          attempt_count: stateRef.current.attemptCount,
          geo_location: geoLocation?.countryCode || 'unknown',
        });

        window.dispatchEvent(new CustomEvent('exit-intent-modal-shown'));
      }
    }, delay);
  }, [shouldShowModal, variant, delay, geoLocation]);

  useViewportExitDetection(enabled && isClient, handleExitIntent);

  const showModal = useCallback(() => {
    if (shouldShowModal()) {
      setIsVisible(true);
      trackExitIntentEvent('shown', { variant });
    }
  }, [shouldShowModal, variant]);

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    stateRef.current.lastShownAt = Date.now();
    sessionStorage.setItem(EXIT_INTENT_SESSION_KEY, JSON.stringify(stateRef.current));

    trackExitIntentEvent('closed', {
      variant,
      attempt_count: stateRef.current.attemptCount,
    });
  }, [variant]);

  const handleConversion = useCallback(async (email: string): Promise<void> => {
    stateRef.current.isSubscribed = true;
    localStorage.setItem('newsletter_subscribed', 'true');
    
    sessionStorage.setItem(EXIT_INTENT_SESSION_KEY, JSON.stringify(stateRef.current));

    trackExitIntentEvent('conversion', {
      variant,
      attempt_count: stateRef.current.attemptCount,
      geo_location: geoLocation?.countryCode || 'unknown',
    });

    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  }, [variant, geoLocation]);

  const geoOffer = getGeoOffer();

  return {
    isVisible: isClient && isVisible && !isAbTestLoading,
    variant,
    geoOffer,
    showModal,
    hideModal,
    handleConversion,
    handleClose,
    state: stateRef.current,
  };
}

export function getExitIntentContent(
  variant: 'default' | 'urgent' | 'bonus',
  geoOffer: GeoOfferConfig | null
): {
  headline: string;
  subtitle: string;
  cta: string;
  icon: string;
  style: Record<string, string>;
} {
  const baseContent = DEFAULT_OFFERS[variant];
  const offer = geoOffer || GEO_OFFERS.DEFAULT;

  const contentMap: Record<string, { headline: string; subtitle: string; cta: string }> = {
    default: {
      headline: offer.headline || baseContent.headline,
      subtitle: offer.subtitle || baseContent.subtitle,
      cta: offer.cta || baseContent.cta,
    },
    urgent: {
      headline: offer.discountPercent 
        ? `⚡ ${offer.discountPercent}% Off - Limited Time!`
        : '⚡ Your Exclusive Offer Expires Soon!',
      subtitle: offer.discountCode
        ? `Use code ${offer.discountCode} at checkout`
        : 'Don\'t miss out on premium AI tools',
      cta: 'Claim My Offer',
    },
    bonus: {
      headline: offer.discountPercent
        ? `🎁 Get ${offer.discountPercent}% + Free Bonus`
        : '🎁 Bonus: Free Premium Week',
      subtitle: offer.discountCode
        ? `Code: ${offer.discountCode} - First month free`
        : 'Unlock all premium features today',
      cta: 'Get Started Free',
    },
  };

  const content = contentMap[variant];

  const iconMap = {
    default: 'mail',
    urgent: 'zap',
    bonus: 'gift',
  };

  const styleMap = {
    default: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400',
    },
    urgent: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400',
    },
    bonus: {
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400',
    },
  };

  return {
    ...content,
    icon: iconMap[variant],
    style: styleMap[variant],
  };
}

export function resetExitIntentState(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('newsletter_subscribed');
  sessionStorage.removeItem(EXIT_INTENT_SESSION_KEY);
  sessionStorage.removeItem('ab_test_exit_intent_headlines');
  console.log('Exit intent state reset successfully');
}
