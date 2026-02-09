'use client';

import React, { useState, useEffect } from 'react';
import { Timer, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists, based on tailwind-merge in package.json

interface DealCountdownProps {
  className?: string;
  dealEnd?: Date; // Optional prop to override end date
}

export function DealCountdown({ className, dealEnd }: DealCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVisible, setIsVisible] = useState(true);

  // Default end date: Next Friday at midnight if not provided
  const calculateTargetDate = () => {
    if (dealEnd) return dealEnd;
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 5 is Friday
    const daysUntilFriday = (5 + 7 - dayOfWeek) % 7 || 7; // If today is Friday, target next Friday
    
    const target = new Date(now);
    target.setDate(now.getDate() + daysUntilFriday);
    target.setHours(23, 59, 59, 999);
    return target;
  };

  const [targetDate] = useState<Date>(calculateTargetDate());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg overflow-hidden',
        className
      )}
    >
      {/* Background glow effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side: Deal Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full animate-pulse">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base tracking-wide">
              DEAL OF THE WEEK
            </p>
            <p className="text-xs sm:text-sm text-white/90">
              Get 50% off Gemini Advanced & Llama Enterprise!
            </p>
          </div>
        </div>

        {/* Right side: Timer */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-center">
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="text-xl font-light self-start mt-1">:</span>
            <TimeUnit value={timeLeft.hours} label="Hrs" />
            <span className="text-xl font-light self-start mt-1">:</span>
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <span className="text-xl font-light self-start mt-1">:</span>
            <TimeUnit value={timeLeft.seconds} label="Secs" />
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg sm:text-xl font-bold font-mono leading-none tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase opacity-75">{label}</span>
    </div>
  );
}
