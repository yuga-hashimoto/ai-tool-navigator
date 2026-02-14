"use client";

import { useTranslations } from 'next-intl';
import { OnboardingRole, OnboardingGoal } from '@/hooks/useOnboarding';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface StepRecommendationsProps {
  onFinish: () => void;
  role: OnboardingRole | null;
  goal: OnboardingGoal | null;
}

export function StepRecommendations({ onFinish, role, goal }: StepRecommendationsProps) {
  const t = useTranslations('Onboarding.steps.recommendations');
  const tRole = useTranslations('Onboarding.steps.role.options');
  const tButtons = useTranslations('Onboarding.buttons');

  const getRecommendationLink = () => {
    // Simple logic mapping
    if (role === 'developer') return '/category/coding';
    if (role === 'marketer') return '/category/marketing';
    if (role === 'designer') return '/category/design';
    if (role === 'founder') return '/category/automation';
    if (role === 'student') return '/category/writing';

    if (goal === 'compare_prices') return '/tools';
    if (goal === 'learn_ai') return '/blog';

    return '/tools';
  };

  const getCategoryName = () => {
    if (role === 'developer') return 'Coding';
    if (role === 'marketer') return 'Marketing';
    if (role === 'designer') return 'Design';
    if (role === 'founder') return 'Automation';
    if (role === 'student') return 'Writing';
    return 'All Tools';
  }

  const link = getRecommendationLink();
  const categoryName = getCategoryName();

  const handleFinish = () => {
    onFinish();
  };

  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500 delay-150">
        <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {t('title')}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            {t('description', { role: tRole(role || 'other') })}
        </p>
      </div>

      <Link
        href={link}
        onClick={handleFinish}
        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <span>Explore {categoryName} Tools</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>

      <button
        onClick={handleFinish}
        className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline underline-offset-4"
      >
        {tButtons('finish')} without redirect
      </button>
    </div>
  );
}
