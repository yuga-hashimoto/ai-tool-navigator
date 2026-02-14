"use client";

import { useOnboarding } from '@/hooks/useOnboarding';
import { StepWelcome } from './StepWelcome';
import { StepRole } from './StepRole';
import { StepGoal } from './StepGoal';
import { StepRecommendations } from './StepRecommendations';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OnboardingModal() {
  const {
    isOpen,
    isLoaded,
    currentStep,
    nextStep,
    prevStep,
    setRole,
    setGoal,
    completeOnboarding,
    skipOnboarding,
    data
  } = useOnboarding();

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded || !isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome onNext={nextStep} />;
      case 1:
        return <StepRole onNext={nextStep} onSelect={setRole} selected={data.role} onBack={prevStep} />;
      case 2:
        return <StepGoal onNext={nextStep} onSelect={setGoal} selected={data.goal} onBack={prevStep} />;
      case 3:
        return <StepRecommendations onFinish={completeOnboarding} role={data.role} goal={data.goal} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
          />
        </div>

        {/* Close/Skip Button */}
        <button
          onClick={skipOnboarding}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
