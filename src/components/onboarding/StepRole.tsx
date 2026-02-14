"use client";

import { useTranslations } from 'next-intl';
import { OnboardingRole } from '@/hooks/useOnboarding';
import { Code2, Megaphone, Paintbrush, Briefcase, GraduationCap, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepRoleProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (role: OnboardingRole) => void;
  selected: OnboardingRole | null;
}

const ROLES: { id: OnboardingRole; icon: any }[] = [
  { id: 'developer', icon: Code2 },
  { id: 'marketer', icon: Megaphone },
  { id: 'designer', icon: Paintbrush },
  { id: 'founder', icon: Briefcase },
  { id: 'student', icon: GraduationCap },
  { id: 'other', icon: User },
];

export function StepRole({ onNext, onBack, onSelect, selected }: StepRoleProps) {
  const t = useTranslations('Onboarding.steps.role');
  const tButtons = useTranslations('Onboarding.buttons');

  const handleSelect = (role: OnboardingRole) => {
    onSelect(role);
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('title')}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ROLES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
              selected === id
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
            )}
          >
            <Icon className="w-8 h-8 mb-3 opacity-80" />
            <span className="font-medium text-sm text-center">{t(`options.${id}`)}</span>
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
