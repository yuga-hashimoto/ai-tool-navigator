'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackABTestVariant, trackABTestImpression, trackABTestConversion } from '@/lib/analytics';

export type OfferType = 'discount' | 'bonus' | 'urgency' | 'value' | 'social';

export interface OfferTestConfig {
  testName: string;
  offerType: OfferType;
  variants: string[];
  weights?: number[];
  persist?: boolean;
  conversionGoal?: string;
}

export const OFFER_TESTS: Record<string, OfferTestConfig> = {
  offer_type_test: {
    testName: 'exit_intent_offer_type',
    offerType: 'discount',
    variants: ['discount_20', 'bonus_free', 'urgency_24h', 'value_prop'],
    weights: [25, 25, 25, 25],
    persist: true,
    conversionGoal: 'email_signup',
  },
  
  discount_amount_test: {
    testName: 'exit_intent_discount_amount',
    offerType: 'discount',
    variants: ['10_percent', '20_percent', '25_percent', '30_percent'],
    weights: [15, 35, 35, 15],
    persist: true,
    conversionGoal: 'email_signup',
  },
  
  cta_text_test: {
    testName: 'exit_intent_cta_text',
    offerType: 'value',
    variants: ['subscribe_now', 'get_started', 'claim_offer', 'join_free'],
    weights: [25, 25, 25, 25],
    persist: true,
    conversionGoal: 'email_signup',
  },
  
  headline_test: {
    testName: 'exit_intent_headline',
    offerType: 'value',
    variants: ['personal', 'exclusive', 'limited', 'community'],
    weights: [25, 25, 25, 25],
    persist: true,
    conversionGoal: 'email_signup',
  },
};

export function useOfferABTest(
  testName: keyof typeof OFFER_TESTS = 'offer_type_test'
): {
  variant: string;
  isLoading: boolean;
  testConfig: OfferTestConfig;
  recordImpression: () => void;
  recordConversion: () => void;
} {
  const [variant, setVariant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const testConfig = OFFER_TESTS[testName];

  useEffect(() => {
    if (!testConfig) {
      console.warn(`A/B test "${testName}" not found, using default`);
      setIsLoading(false);
      return;
    }

    const assignVariant = () => {
      const storageKey = `ab_test_${testConfig.testName}`;
      
      if (testConfig.persist) {
        const stored = sessionStorage.getItem(storageKey);
        if (stored && testConfig.variants.includes(stored)) {
          setVariant(stored);
          trackABTestVariant(testConfig.testName, stored);
          setIsLoading(false);
          return;
        }
      }

      const weights = testConfig.weights || testConfig.variants.map(() => 100 / testConfig.variants.length);
      const random = Math.random() * 100;
      let cumulative = 0;
      let assigned = testConfig.variants[0];

      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          assigned = testConfig.variants[i];
          break;
        }
      }

      if (testConfig.persist) {
        sessionStorage.setItem(storageKey, assigned);
      }

      trackABTestVariant(testConfig.testName, assigned);
      setVariant(assigned);
      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      assignVariant();
    }
  }, [testConfig]);

  const recordImpression = useCallback(() => {
    if (!variant || isLoading) return;
    trackABTestImpression(testConfig.testName, variant);
  }, [variant, isLoading, testConfig]);

  const recordConversion = useCallback(() => {
    if (!variant || isLoading) return;
    trackABTestConversion(testConfig.testName, variant, 1);
  }, [variant, isLoading, testConfig]);

  return {
    variant,
    isLoading,
    testConfig,
    recordImpression,
    recordConversion,
  };
}

export function useMultiArmedBandit(
  testName: string,
  variants: string[],
  options: {
    initialWeights?: number[];
    learningRate?: number;
    persist?: boolean;
  } = {}
): {
  selectedVariant: string;
  updateWeight: (variant: string, converted: boolean) => void;
  isLoading: boolean;
} {
  const { initialWeights, learningRate = 0.1, persist = true } = options;
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [weights, setWeights] = useState<number[]>(initialWeights || variants.map(() => 1));
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!testName) return;

    const storageKey = `mab_${testName}`;
    
    if (persist) {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        try {
          const { variant: storedVariant, weights: storedWeights } = JSON.parse(stored);
          if (variants.includes(storedVariant)) {
            setSelectedVariant(storedVariant);
            setWeights(storedWeights);
            setCounts(JSON.parse(sessionStorage.getItem(`${storageKey}_counts`) || '{}'));
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to restore MAB state:', e);
        }
      }
    }

    const randomIndex = Math.floor(Math.random() * variants.length);
    const initial = variants[randomIndex];
    setSelectedVariant(initial);
    setCounts(prev => ({ ...prev, [initial]: 0 }));
    setIsLoading(false);
  }, [testName, variants, persist]);

  const updateWeight = useCallback((variant: string, converted: boolean) => {
    setWeights(prev => {
      const newWeights = [...prev];
      const variantIndex = variants.indexOf(variant);
      if (variantIndex === -1) return prev;

      const adjustment = converted ? learningRate : -learningRate * 0.5;
      newWeights[variantIndex] = Math.max(0.1, newWeights[variantIndex] + adjustment);

      const total = newWeights.reduce((a, b) => a + b, 0);
      const normalized = newWeights.map(w => w / total);

      if (persist) {
        sessionStorage.setItem(`mab_${testName}`, JSON.stringify({
          variant: selectedVariant,
          weights: normalized,
        }));
        sessionStorage.setItem(`${testName}_counts`, JSON.stringify({
          ...counts,
          [variant]: (counts[variant] || 0) + 1,
        }));
      }

      return normalized;
    });

    setCounts(prev => ({
      ...prev,
      [variant]: (prev[variant] || 0) + 1,
    }));
  }, [variants, learningRate, persist, selectedVariant, counts, testName]);

  return {
    selectedVariant,
    updateWeight,
    isLoading,
  };
}

export function getActiveOfferTests(): string[] {
  return Object.keys(OFFER_TESTS);
}

export function resetOfferTests(testName?: string): void {
  if (typeof window === 'undefined') return;

  if (testName) {
    sessionStorage.removeItem(`ab_test_${OFFER_TESTS[testName]?.testName || testName}`);
    sessionStorage.removeItem(`mab_${testName}`);
    sessionStorage.removeItem(`${testName}_counts`);
  } else {
    Object.keys(OFFER_TESTS).forEach(key => {
      sessionStorage.removeItem(`ab_test_${OFFER_TESTS[key].testName}`);
    });
    Object.keys(sessionStorage)
      .filter(key => key.startsWith('mab_'))
      .forEach(key => sessionStorage.removeItem(key));
  }
}
