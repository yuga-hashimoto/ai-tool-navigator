'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { sendGAEvent } from '@/lib/analytics';
import { CheckCircle } from 'lucide-react';

export default function FooterNewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('Footer.newsletter');

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
      sendGAEvent('sign_up', { method: 'footer_newsletter' });
      localStorage.setItem('newsletter_subscribed', 'true');
    } catch (err) {
      console.error('Failed to subscribe', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('success')}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md lg:max-w-none">
      <h3 className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
        {t('title')}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t('description')}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex gap-x-4">
        <label htmlFor="email-address" className="sr-only">
          {t('placeholder')}
        </label>
        <input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-w-0 flex-auto rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-blue-500"
          placeholder={t('placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('submitting') : t('button')}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
