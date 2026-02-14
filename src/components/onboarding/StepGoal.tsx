"use client";

import { useTranslations } from 'next-intl';
import { OnboardingGoal } from '@/hooks/useOnboarding';
import { Search, Scale, TrendingUp, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepGoalProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (goal: OnboardingGoal) => void;
  selected: OnboardingGoal | null;
}

const GOALS: { id: OnboardingGoal; icon: any }[] = [
  { id: 'find_tools', icon: Search },
  { id: 'compare_prices', icon: Scale },
  { id: 'learn_ai', icon: TrendingUp },
  { id: 'productivity', icon: Zap },
];

export function StepGoal({ onNext, onBack, onSelect, selected }: StepGoalProps) {
  const t = useTranslations('Onboarding.steps.goal');
  const tButtons = useTranslations('Onboarding.buttons');

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GOALS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left p-6 rounded-xl border-2 transition-all hover:scale-[1.02] gap-4",
              selected === id
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg",
              selected === id ? "bg-blue-100 dark:bg-blue-900/40" : "bg-zinc-100 dark:bg-zinc-800"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base">{t(`options.${id}`)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tButtons('back')}
        </button>

        <button
          onClick={onNext}
          disabled={!selected}
          className={cn(
            "px-8 py-2 rounded-full font-medium flex items-center gap-2 transition-all",
            selected
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
          )}
        >
          {tButtons('next')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
