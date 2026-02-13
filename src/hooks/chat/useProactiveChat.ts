// useProactiveChat - Proactive chat triggers hook
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProactiveTrigger, defaultTriggers } from '@/lib/chat-config';

interface TriggerEvent {
  type: 'time_on_page' | 'scroll_depth' | 'exit_intent' | 'page_visit';
  data?: any;
}

export function useProactiveChat(options: {
  sessionId: string;
  isEnabled?: boolean;
  onTrigger?: (trigger: ProactiveTrigger) => void;
} = {} as any) {
  const { sessionId, isEnabled = true, onTrigger } = options;

  const [activeTriggers, setActiveTriggers] = useState<ProactiveTrigger[]>(defaultTriggers);
  const [shownTriggers, setShownTriggers] = useState<Set<string>>(new Set());
  const [pendingTrigger, setPendingTrigger] = useState<ProactiveTrigger | null>(null);
  
  const timeOnPageRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDepthRef = useRef<number>(0);

  // Load custom triggers from API
  useEffect(() => {
    const loadTriggers = async () => {
      try {
        const response = await fetch('/api/chat/triggers');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setActiveTriggers([...defaultTriggers, ...data.data]);
        }
      } catch (error) {
        console.error('Error loading triggers:', error);
      }
    };

    if (isEnabled) {
      loadTriggers();
    }
  }, [isEnabled]);

  // Time on page trigger
  useEffect(() => {
    if (!isEnabled) return;

    activeTriggers.forEach(trigger => {
      if (trigger.triggerType === 'time_on_page' && trigger.conditions.minTimeOnPage) {
        const timeMs = trigger.conditions.minTimeOnPage;
        
        timeOnPageRef.current = setTimeout(() => {
          if (!shownTriggers.has(trigger.id)) {
            checkTriggerConditions(trigger, { type: 'time_on_page' });
          }
        }, timeMs);
      }
    });

    return () => {
      if (timeOnPageRef.current) {
        clearTimeout(timeOnPageRef.current);
      }
    };
  }, [activeTriggers, isEnabled, shownTriggers]);

  // Scroll depth tracking
  useEffect(() => {
    if (!isEnabled) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      scrollDepthRef.current = scrollPercent;

      activeTriggers.forEach(trigger => {
        if (trigger.triggerType === 'scroll_depth' && trigger.conditions.minScrollDepth) {
          if (scrollPercent >= trigger.conditions.minScrollDepth && !shownTriggers.has(trigger.id)) {
            checkTriggerConditions(trigger, { type: 'scroll_depth', data: { scrollPercent } });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTriggers, isEnabled, shownTriggers]);

  // Exit intent detection
  useEffect(() => {
    if (!isEnabled) return;

    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        activeTriggers.forEach(trigger => {
          if (trigger.triggerType === 'exit_intent' && !shownTriggers.has(trigger.id)) {
            checkTriggerConditions(trigger, { type: 'exit_intent' });
          }
        });
      }
    };

    document.addEventListener('mouseenter', handleExitIntent);
    
    return () => document.removeEventListener('mouseenter', handleExitIntent);
  }, [activeTriggers, isEnabled, shownTriggers]);

  // Check trigger conditions
  const checkTriggerConditions = useCallback((trigger: ProactiveTrigger, event: TriggerEvent) => {
    // Check targeting conditions
    const { targeting } = trigger;

    // Check if page is excluded
    if (targeting.excludePages?.includes(window.location.pathname)) {
      return false;
    }

    // Check specific pages
    if (targeting.specificPages && targeting.specificPages.length > 0) {
      if (!targeting.specificPages.includes(window.location.pathname)) {
        return false;
      }
    }

    // Check session trigger limit
    if (trigger.maxPerSession && shownTriggers.has(trigger.id)) {
      return false;
    }

    // Trigger matched!
    showTrigger(trigger);
    return true;
  }, [shownTriggers]);

  // Show trigger
  const showTrigger = useCallback((trigger: ProactiveTrigger) => {
    setShownTriggers(prev => new Set([...prev, trigger.id]));

    const delay = trigger.delay || 0;
    
    setTimeout(() => {
      setPendingTrigger(trigger);
      onTrigger?.(trigger);
    }, delay);
  }, [onTrigger]);

  // Dismiss trigger
  const dismissTrigger = useCallback(() => {
    setPendingTrigger(null);
  }, []);

  // Accept trigger
  const acceptTrigger = useCallback(() => {
    if (pendingTrigger) {
      // Trigger chat session or action
      setPendingTrigger(null);
    }
  }, [pendingTrigger]);

  // Reset shown triggers (for new session)
  const resetTriggers = useCallback(() => {
    setShownTriggers(new Set());
    setPendingTrigger(null);
  }, []);

  return {
    pendingTrigger,
    shownTriggers,
    dismissTrigger,
    acceptTrigger,
    resetTriggers,
  };
}

export default useProactiveChat;
