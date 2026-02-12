'use client';

import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sendGAEvent } from '@/lib/analytics';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations('NewsletterPopup');

  // Set isClient on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check localStorage on mount to see if user dismissed/subscribed recently
  useEffect(() => {
    if (!isClient) return;

    const closedAt = localStorage.getItem('newsletter_popup_closed');
    const subscribed = localStorage.getItem('newsletter_subscribed');

    if (subscribed) {
      return;
    }

    if (closedAt) {
      const closedDate = new Date(parseInt(closedAt, 10));
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - closedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return;
      }
    }

    // Show popup after a small delay (e.g., 3 seconds)
    const timer = setTimeout(() => {
      // Double check subscription status before showing
      if (localStorage.getItem('newsletter_subscribed')) {
        return;
      }
      setIsVisible(true);
    }, 3000);

    const handleExitIntentTriggered = () => {
      setIsVisible(false);
    };

    window.addEventListener('exit-intent-triggered', handleExitIntentTriggered);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('exit-intent-triggered', handleExitIntentTriggered);
    };
  }, [isClient]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter_popup_closed', Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) 
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setSubmitted(true);
      sendGAEvent('sign_up', { method: 'newsletter_popup' });
      localStorage.setItem('newsletter_subscribed', 'true');

      // Auto-close after success message
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to subscribe', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="mb-3 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('successTitle')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('successSubtitle')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900/30">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <input
                  type="email"
                  placeholder={t('placeholder')}
                  className={`w-full rounded-md border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-400'
                  } dark:bg-gray-800 dark:text-white`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('submitting') : t('button')}
              </button>
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                {t('spam')}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
