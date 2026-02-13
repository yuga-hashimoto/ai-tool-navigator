'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function NewsletterManagement() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const t = useTranslations('NewsletterManagement');

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to unsubscribe');
      }

      setStatus('success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setErrorMessage(error.message || t('error'));
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-md bg-green-50 p-6 text-center dark:bg-green-900/30">
        <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
          {t('unsubscribedTitle')}
        </h3>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          {t('unsubscribedMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 dark:bg-zinc-900">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('description')}
            </p>
        </div>
      <form onSubmit={handleUnsubscribe} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
            {t('emailLabel')}
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? t('submitting') : t('unsubscribeButton')}
          </button>
        </div>
        {status === 'error' && (
            <p className="text-center text-sm text-red-600">
                {errorMessage}
            </p>
        )}
      </form>
    </div>
  );
}
