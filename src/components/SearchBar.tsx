"use client";

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useRef, useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search tools...',
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState<string | undefined>(undefined);

  const displayValue = localValue !== undefined ? localValue : value;

  // Sync local value with prop value if it changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
      }, 300);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative max-w-xl w-full', className)}>
      <div
        className={cn(
          'relative flex items-center transition-all duration-200',
          isFocused
            ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900'
            : ''
        )}
      >
        <Search
          className={cn(
            'absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors',
            isFocused
              ? 'text-blue-500'
              : 'text-zinc-400'
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition-colors',
            'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100',
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            'focus:border-blue-500'
          )}
        />
        {displayValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        )}
      </div>
    </div>
  );
}
