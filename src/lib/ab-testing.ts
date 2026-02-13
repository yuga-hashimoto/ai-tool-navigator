'use client';

import { useState, useEffect } from 'react';
import { trackABTestVariant } from '@/lib/analytics';

type Variant = 'default' | 'urgent' | 'bonus';

/**
 * A/B Testing Configuration
 */
export interface ABTestConfig {
  testName: string;
  variants: Variant[];
  weights?: number[]; // Should sum to 100
  persist?: boolean; // Whether to persist the variant assignment
}

/**
 * Default A/B test configurations for exit intent modal
 */
export const EXIT_INTENT_TESTS: Record<string, ABTestConfig> = {
  headline_test: {
    testName: 'exit_intent_headlines',
    variants: ['default', 'urgent', 'bonus'],
    weights: [40, 30, 30], // 40% default, 30% urgent, 30% bonus
    persist: true,
  },
  cta_test: {
    testName: 'exit_intent_cta',
    variants: ['default', 'urgent', 'bonus'],
    weights: [33, 33, 34],
    persist: true,
  },
};

/**
 * Hook to manage A/B test variant assignment
 */
export function useABTest(config: ABTestConfig): {
  variant: Variant;
  isLoading: boolean;
  testName: string;
} {
  const [variant, setVariant] = useState<Variant>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [testName] = useState(config.testName);

  useEffect(() => {
    const assignVariant = () => {
      // Check if variant is already assigned in session storage
      if (config.persist) {
        const storedVariant = sessionStorage.getItem(`ab_test_${config.testName}`);
        if (storedVariant && config.variants.includes(storedVariant as Variant)) {
          setVariant(storedVariant as Variant);
          trackABTestVariant(config.testName, storedVariant);
          setIsLoading(false);
          return;
        }
      }

      // Randomly assign variant based on weights
      const weights = config.weights || config.variants.map(() => 100 / config.variants.length);
      const random = Math.random() * 100;
      let cumulative = 0;
      let assignedVariant = config.variants[0];

      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          assignedVariant = config.variants[i];
          break;
        }
      }

      // Store the assignment
      if (config.persist) {
        sessionStorage.setItem(`ab_test_${config.testName}`, assignedVariant);
      }

      // Track the assignment
      trackABTestVariant(config.testName, assignedVariant);

      setVariant(assignedVariant);
      setIsLoading(false);
    };

    // Only run in browser
    if (typeof window !== 'undefined') {
      assignVariant();
    } else {
      setIsLoading(false);
    }
  }, [config]);

  return { variant, isLoading, testName };
}

/**
 * Hook specifically for exit intent modal A/B testing
 */
export function useExitIntentABTest(): {
  variant: Variant;
  isLoading: boolean;
  testName: string;
} {
  return useABTest(EXIT_INTENT_TESTS.headline_test);
}

/**
 * Get all active A/B tests
 */
export function getActiveTests(): string[] {
  return Object.keys(EXIT_INTENT_TESTS);
}

/**
 * Reset A/B test assignments (useful for testing)
 */
export function resetABTest(testName?: string): void {
  if (typeof window === 'undefined') return;

  if (testName) {
    sessionStorage.removeItem(`ab_test_${testName}`);
  } else {
    // Reset all tests
    Object.keys(EXIT_INTENT_TESTS).forEach(key => {
      sessionStorage.removeItem(`ab_test_${key}`);
    });
  }
}
