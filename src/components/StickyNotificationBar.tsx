'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function StickyNotificationBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const t = useTranslations('StickyNotificationBar');

  useEffect(() => {
    const closed = localStorage.getItem('sticky_notification_closed');
    const subscribed = localStorage.getItem('newsletter_subscribed');
    if (!closed && !subscribed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('sticky_notification_closed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        localStorage.setItem('newsletter_subscribed', 'true');
        setTimeout(() => setIsVisible(false), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative z-50 bg-zinc-900 px-4 py-3 text-white dark:bg-zinc-50 dark:text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm font-medium text-center sm:text-left">
          {t('text')}
        </p>

        {status === 'success' ? (
           <div className="flex items-center gap-2 text-sm font-medium text-green-400 dark:text-green-600">
             <Check className="h-4 w-4" />
             {t('success')}
           </div>
        ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2 sm:w-auto">
              <input
                type="email"
                required
                placeholder={t('placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-w-0 rounded-md border-0 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/60 focus:ring-2 focus:ring-inset focus:ring-white dark:bg-black/5 dark:text-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-900 sm:w-64"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex-none rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                {status === 'loading' ? '...' : t('button')}
              </button>
            </form>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-2 top-2 p-1 sm:static sm:p-2 transition-opacity hover:opacity-70"
          aria-label={t('close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
