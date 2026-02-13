"use client";

import { useState, useRef, useCallback } from 'react';
import { ChevronDown, ArrowUpDown, Star, Clock, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortOption } from './ToolsPageContent';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'popularity', label: 'Popularity', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'rating', label: 'Rating', icon: <Star className="h-4 w-4" /> },
  { value: 'recent', label: 'Most Recent', icon: <Clock className="h-4 w-4" /> },
  { value: 'name', label: 'Name (A-Z)', icon: <Calendar className="h-4 w-4" /> },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (optionValue: SortOption) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Handle click outside
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
          'border-zinc-200 dark:border-zinc-700',
          'bg-white dark:bg-zinc-900',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800',
          'text-zinc-700 dark:text-zinc-300'
        )}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>Sort by:</span>
        <span className="text-blue-600 dark:text-blue-400">{selectedOption?.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 rounded-lg border shadow-lg',
            'bg-white dark:bg-zinc-900',
            'border-zinc-200 dark:border-zinc-800',
            'z-50'
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors',
                'hover:bg-zinc-50 dark:hover:bg-zinc-800',
                value === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-700 dark:text-zinc-300'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
