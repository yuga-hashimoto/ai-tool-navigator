"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const CITIES = ['London', 'New York', 'Tokyo', 'San Francisco', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'Singapore', 'Mumbai'];
const TOOLS = ['ChatGPT', 'Jasper', 'Midjourney', 'Claude', 'Copy.ai', 'Notion AI', 'Stable Diffusion', 'Runway', 'Synthesia'];

type NotificationType = 'viewed' | 'watching';

interface NotificationMessage {
  type: NotificationType;
  location?: string;
  tool?: string;
  count?: number;
}

export function SocialProof() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<NotificationMessage | null>(null);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations('SocialProof');

  useEffect(() => {
    setMounted(true);

    const showNotification = () => {
      const isViewed = Math.random() > 0.4; // 60% chance of "Someone viewed..."

      let newMessage: NotificationMessage;
      if (isViewed) {
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
        newMessage = { type: 'viewed', location: city, tool: tool };
      } else {
        const count = Math.floor(Math.random() * 50) + 15; // 15-65 people
        newMessage = { type: 'watching', count };
      }

      setMessage(newMessage);
      setIsVisible(true);

      // Hide after 5 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);

        // Schedule next notification
        const nextDelay = Math.random() * 30000 + 15000; // 15-45s
        timeoutRef.current = setTimeout(showNotification, nextDelay);
      }, 5000);
    };

    // Initial delay
    timeoutRef.current = setTimeout(showNotification, 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  if (!mounted || !message) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg transition-all duration-500 dark:border-zinc-800 dark:bg-zinc-900",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0 pointer-events-none"
      )}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        aria-label={t('close')}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
          {message.type === 'viewed' ? (
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {message.type === 'viewed'
              ? t('viewed', { location: message.location || 'Someone', tool: message.tool || 'a tool' })
              : t('watching', { count: message.count || 1 })
            }
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('recent')}
          </p>
        </div>
      </div>
    </div>
  );
}
