"use client";

import { useState, useEffect } from 'react';

export type OnboardingRole = 'developer' | 'marketer' | 'designer' | 'founder' | 'student' | 'other';
export type OnboardingGoal = 'find_tools' | 'compare_prices' | 'learn_ai' | 'productivity';

export interface OnboardingData {
  role: OnboardingRole | null;
  goal: OnboardingGoal | null;
}

export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: null,
    goal: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const isComplete = localStorage.getItem('onboarding_complete');
    if (!isComplete) {
      setIsOpen(true);
    }

    // Load saved preferences if any (optional, for partial completion)
    const savedRole = localStorage.getItem('user_role') as OnboardingRole | null;
    const savedGoal = localStorage.getItem('user_goal') as OnboardingGoal | null;

    setData({
      role: savedRole,
      goal: savedGoal
    });

    setIsLoaded(true);
  }, []);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  const setRole = (role: OnboardingRole) => {
    setData((prev) => ({ ...prev, role }));
    localStorage.setItem('user_role', role);
  };

  const setGoal = (goal: OnboardingGoal) => {
    setData((prev) => ({ ...prev, goal }));
    localStorage.setItem('user_goal', goal);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setIsOpen(false);
  };

  const skipOnboarding = () => {
     localStorage.setItem('onboarding_complete', 'skipped');
     setIsOpen(false);
  }

  return {
    isOpen,
    isLoaded,
    currentStep,
    data,
    nextStep,
    prevStep,
    setRole,
    setGoal,
    completeOnboarding,
    skipOnboarding
  };
}
