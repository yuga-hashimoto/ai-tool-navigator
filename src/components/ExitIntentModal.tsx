'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Mail, CheckCircle, Gift, ArrowRight, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sendGAEvent, trackExitIntentEvent } from '@/lib/analytics';
import { hashEmail } from '@/lib/security/email-hashing';

interface ExitIntentModalProps {
  variant?: 'default' | 'urgent' | 'bonus';
  enabled?: boolean;
}

type FormData = {
  email: string;
};

export default function ExitIntentModal({ variant = 'default', enabled = true }: ExitIntentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const t = useTranslations('ExitIntentModal');

  // Set isClient on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize tracking
  useEffect(() => {
    if (!isClient) return;
    const storedAttemptCount = parseInt(localStorage.getItem('exit_intent_attempt_count') || '0', 10);
    setAttemptCount(storedAttemptCount);
  }, [isClient]);

  // Check if modal should be shown
  const shouldShowModal = useCallback(() => {
    if (!enabled) return false;
    if (!isClient) return false;
    if (submitted) return false;

    const subscribed = localStorage.getItem('newsletter_subscribed');
    if (subscribed) return false;

    const closedAt = localStorage.getItem('exit_intent_popup_closed');
    if (closedAt) {
      const closedDate = new Date(parseInt(closedAt, 10));
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - closedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return false;
    }

    // Only show once per session after 2 attempts
    const sessionKey = 'exit_intent_session_shown';
    const sessionShown = sessionStorage.getItem(sessionKey);
    if (sessionShown && attemptCount >= 2) return false;

    return true;
  }, [enabled, isClient, submitted, attemptCount]);

  // Handle exit intent detection
  useEffect(() => {
    if (!isClient || !enabled) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
        if (shouldShowModal()) {
          setIsVisible(true);
          setHasTriggered(true);
          
          // Update attempt count
          const newCount = attemptCount + 1;
          setAttemptCount(newCount);
          localStorage.setItem('exit_intent_attempt_count', newCount.toString());
          
          // Track the event
          trackExitIntentEvent('triggered', {
            variant,
            attempt_count: newCount,
          });
          
          window.dispatchEvent(new CustomEvent('exit-intent-modal-triggered'));
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isClient, enabled, hasTriggered, shouldShowModal, variant, attemptCount]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem('exit_intent_popup_closed', Date.now().toString());
    
    trackExitIntentEvent('closed', {
      variant,
      attempt_count: attemptCount,
    });
  }, [variant, attemptCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      // Hash email before sending
      const hashedEmail = await hashEmail(email);

      const response = await fetch('/api/leads/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: hashedEmail,
          original_email_hash: hashedEmail,
          variant,
          source: 'exit_intent_modal',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
      
      // Track conversion
      trackExitIntentEvent('conversion', {
        variant,
        attempt_count: attemptCount,
      });
      
      sendGAEvent('exit_intent_signup', { 
        variant,
        method: 'exit_intent_modal',
      });
      
      localStorage.setItem('newsletter_subscribed', 'true');

    } catch (err) {
      console.error('Exit intent submission error:', err);
      setError(t('error'));
      trackExitIntentEvent('error', {
        variant,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not visible
  if (!isClient || !isVisible) return null;

  // Render different variants
  const renderContent = () => {
    if (submitted) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('successTitle')}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('successSubtitle')}
          </p>
        </div>
      );
    }

    const variantStyles = {
      default: {
        icon: <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        button: 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400',
      },
      urgent: {
        icon: <Zap className="h-10 w-10 text-amber-600 dark:text-amber-400" />,
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        button: 'bg-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400',
      },
      bonus: {
        icon: <Gift className="h-10 w-10 text-purple-600 dark:text-purple-400" />,
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        button: 'bg-purple-600 hover:bg-purple-500 dark:bg-purple-500 dark:hover:bg-purple-400',
      },
    };

    const style = variantStyles[variant];

    return (
      <>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className={`mb-4 rounded-full p-4 ${style.iconBg}`}>
            {style.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t(`variants.${variant}.title`)}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t(`variants.${variant}.subtitle`)}
          </p>
          {variant === 'bonus' && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
              <Gift className="h-3 w-3" />
              {t('variants.bonus.badge')}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <input
              type="email"
              placeholder={t('placeholder')}
              className={`w-full rounded-lg border px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-400'
              } dark:bg-gray-800 dark:text-white transition-all`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              aria-label="Email address"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('submitting')}
              </span>
            ) : (
              <>
                {t('button')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            {t('spam')}
            <span className="mx-1">•</span>
            {t('privacy')}
          </p>
        </form>
      </>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label={t('close')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Decorative gradient top bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div id="exit-intent-title" className="sr-only">
          {t('variants.default.title')}
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
