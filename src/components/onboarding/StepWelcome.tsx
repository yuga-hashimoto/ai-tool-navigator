"use client";

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const t = useTranslations('Onboarding.steps.welcome');

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
        <span className="text-4xl">🚀</span>
      </div>

      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
        {t('title')}
      </h2>

      <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
        {t('description')}
      </p>

      <button
        onClick={onNext}
        className="group mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all hover:scale-105"
      >
        {t('cta')}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
