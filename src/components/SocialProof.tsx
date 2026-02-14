"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye, MapPin, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

const CITIES = ['London', 'New York', 'Tokyo', 'San Francisco', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'Singapore', 'Mumbai'];
const TOOLS = ['ChatGPT', 'Jasper', 'Midjourney', 'Claude', 'Copy.ai', 'Notion AI', 'Stable Diffusion', 'Runway', 'Synthesia'];

type NotificationType = 'viewed' | 'watching' | 'purchased';

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
  const params = useParams();
  const slug = params?.slug as string | undefined;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const showNotification = async () => {
      try {
        let newMessage: NotificationMessage | null = null;

        // Fetch real activity
        try {
            const url = slug ? `/api/activity?slug=${slug}` : '/api/activity';
            const res = await fetch(url);

            if (res.ok) {
                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { activities, activeViewers, toolStats } = data;

                const showActiveViewers = Math.random() > 0.5;

                if (slug && toolStats?.activeViewers > 1 && showActiveViewers) {
                     newMessage = { type: 'watching', count: toolStats.activeViewers };
                } else if (activities && activities.length > 0) {
                     // Pick a random recent activity
                     const activity = activities[Math.floor(Math.random() * activities.length)];
                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     let details: any = {};
                     try {
                        details = activity.details ? JSON.parse(activity.details) : {};
                     } catch {}

                     const toolName = details.toolName || details.title || (details.pathname ? details.pathname.split('/').pop() : 'AI Tool');
                     const location = activity.location || CITIES[Math.floor(Math.random() * CITIES.length)];

                     if (activity.type === 'PURCHASE') {
                         newMessage = { type: 'purchased', location, tool: toolName };
                     } else if (activity.type === 'VIEW') {
                         newMessage = { type: 'viewed', location, tool: toolName };
                     }
                }
            }
        } catch (e) {
            console.error("Failed to fetch activity:", e);
        }

        // Fallback to mock
        if (!newMessage) {
            const isViewed = Math.random() > 0.4;
            if (isViewed) {
                const city = CITIES[Math.floor(Math.random() * CITIES.length)];
                const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
                newMessage = { type: 'viewed', location: city, tool: tool };
            } else {
                const count = Math.floor(Math.random() * 50) + 15;
                newMessage = { type: 'watching', count };
            }
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

      } catch {
           // Retry
           timeoutRef.current = setTimeout(showNotification, 20000);
      }
    };

    // Initial delay
    timeoutRef.current = setTimeout(showNotification, 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [slug]);

  if (!mounted || !message) return null;

  let Icon = Eye;
  if (message.type === 'viewed') Icon = MapPin;
  if (message.type === 'purchased') Icon = ShoppingCart;

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
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            {message.type === 'viewed'
              ? t('viewed', { location: message.location, tool: message.tool })
              : message.type === 'purchased'
              ? t('purchased', { location: message.location, tool: message.tool })
              : t('watching', { count: message.count })
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
