"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  getVisitorCookieName,
  getSessionCookieName,
  generateRecoveryUrl,
  AbandonmentType,
  RecoveryStatus,
} from "@/lib/abandoned-link-recovery";

interface UseAbandonedLinkRecoveryOptions {
  toolSlug: string;
  toolName: string;
  affiliateId?: string;
  enableExitIntent?: boolean;
  enableTabClose?: boolean;
  enableTimeout?: boolean;
  exitIntentThreshold?: number; // px from top to trigger exit intent
  timeoutSeconds?: number;
  onAbandonmentCaptured?: (data: {
    sessionId: string;
    abandonmentType: AbandonmentType;
  }) => void;
  onEmailCaptured?: (email: string, sessionId: string) => void;
}

interface UseAbandonedLinkRecoveryReturn {
  sessionId: string;
  isAbandonmentModalOpen: boolean;
  openAbandonmentModal: () => void;
  closeAbandonmentModal: () => void;
  captureEmail: (email: string) => Promise<boolean>;
  recordPageExit: (type: AbandonmentType) => void;
  recordTimeOnPage: (seconds: number) => void;
  recordScrollDepth: (depth: number) => void;
  getRecoveryLink: () => string;
}

export function useAbandonedLinkRecovery(
  options: UseAbandonedLinkRecoveryOptions
): UseAbandonedLinkRecoveryReturn {
  const {
    toolSlug,
    toolName,
    affiliateId,
    enableExitIntent = true,
    enableTabClose = true,
    enableTimeout = true,
    exitIntentThreshold = 100,
    timeoutSeconds = 60,
    onAbandonmentCaptured,
    onEmailCaptured,
  } = options;

  const sessionIdRef = useRef<string>('');
  const exitIntentTriggeredRef = useRef(false);
  const timeSpentRef = useRef(0);
  const scrollDepthRef = useRef(0);
  const isModalOpenRef = useRef(false);

  // Get or create session ID
  const getSessionId = useCallback((): string => {
    if (sessionIdRef.current) return sessionIdRef.current;

    if (typeof document === 'undefined') return '';

    const cookieName = getSessionCookieName();
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName && value) {
        sessionIdRef.current = value;
        return value;
      }
    }

    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionIdRef.current = newSessionId;

    // Store in cookie
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `${cookieName}=${newSessionId};expires=${expires.toUTCString()};path=/;SameSite=Lax`;

    return newSessionId;
  }, []);

  // Open abandonment modal
  const openAbandonmentModal = useCallback(() => {
    isModalOpenRef.current = true;
    // Dispatch custom event for UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('abandonment:modal:open'));
    }
  }, []);

  // Close abandonment modal
  const closeAbandonmentModal = useCallback(() => {
    isModalOpenRef.current = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('abandonment:modal:close'));
    }
  }, []);

  // Capture visitor email
  const captureEmail = useCallback(async (email: string): Promise<boolean> => {
    const sessionId = getSessionId();

    try {
      const response = await fetch('/api/abandonment/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email,
          visitorId: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        }),
      });

      if (response.ok) {
        onEmailCaptured?.(email, sessionId);
        closeAbandonmentModal();
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Abandonment] Failed to capture email:', error);
      return false;
    }
  }, [getSessionId, onEmailCaptured, closeAbandonmentModal]);

  // Record page exit/abandonment
  const recordPageExit = useCallback((type: AbandonmentType) => {
    const sessionId = getSessionId();

    // Don't record if modal is open (user is engaging)
    if (isModalOpenRef.current) return;

    // Debounce exit intent (only once per session)
    if (type === 'exit_intent' && exitIntentTriggeredRef.current) return;

    fetch('/api/abandonment/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        toolSlug,
        toolName,
        affiliateId: affiliateId || 'direct',
        abandonmentType: type,
        timeOnPage: timeSpentRef.current,
        scrollDepth: scrollDepthRef.current,
        entryPage: typeof window !== 'undefined' ? window.location.pathname : '',
        exitPage: typeof document !== 'undefined' ? document.referrer : '',
        source: 'direct',
        medium: 'referral',
      }),
    }).then(() => {
      exitIntentTriggeredRef.current = true;
      onAbandonmentCaptured?.({ sessionId, abandonmentType: type });

      // Show modal for exit intent
      if (type === 'exit_intent' || type === 'tab_close') {
        openAbandonmentModal();
      }
    }).catch(error => {
      console.error('[Abandonment] Failed to record exit:', error);
    });
  }, [toolSlug, toolName, affiliateId, getSessionId, onAbandonmentCaptured, openAbandonmentModal]);

  // Record time spent on page
  const recordTimeOnPage = useCallback((seconds: number) => {
    timeSpentRef.current = seconds;
  }, []);

  // Record scroll depth
  const recordScrollDepth = useCallback((depth: number) => {
    scrollDepthRef.current = Math.max(scrollDepthRef.current, depth);
  }, []);

  // Get recovery link
  const getRecoveryLink = useCallback((): string => {
    const sessionId = getSessionId();
    return generateRecoveryUrl(
      typeof window !== 'undefined' ? window.location.origin : '',
      sessionId,
      affiliateId || 'direct',
      toolSlug,
      'recovery'
    );
  }, [toolSlug, affiliateId, getSessionId]);

  // Setup exit intent detection
  useEffect(() => {
    if (!enableExitIntent || typeof document === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= exitIntentThreshold) {
        recordPageExit('exit_intent');
      }
    };

    document.addEventListener('mouseleave', handleMouseMove);
    return () => document.removeEventListener('mouseleave', handleMouseMove);
  }, [enableExitIntent, exitIntentThreshold, recordPageExit]);

  // Setup tab/close detection
  useEffect(() => {
    if (!enableTabClose || typeof window === 'undefined') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only trigger if not modal open and some engagement happened
      if (!isModalOpenRef.current && timeSpentRef.current > 10) {
        recordPageExit('tab_close');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enableTabClose, recordPageExit]);

  // Setup timeout detection
  useEffect(() => {
    if (!enableTimeout) return;

    const interval = setInterval(() => {
      timeSpentRef.current += 1;

      if (timeSpentRef.current >= timeoutSeconds && !isModalOpenRef.current) {
        recordPageExit('timeout');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enableTimeout, timeoutSeconds, recordPageExit]);

  // Track scroll depth
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      recordScrollDepth(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [recordScrollDepth]);

  return {
    sessionId: getSessionId(),
    isAbandonmentModalOpen: isModalOpenRef.current,
    openAbandonmentModal,
    closeAbandonmentModal,
    captureEmail,
    recordPageExit,
    recordTimeOnPage,
    recordScrollDepth,
    getRecoveryLink,
  };
}