'use client';

import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check localStorage on mount to see if user dismissed/subscribed recently
  useEffect(() => {
    setIsClient(true);
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
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter_popup_closed', Date.now().toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate API call
    console.log('Subscribing email:', email);
    
    try {
      await fetch('/api/subscribe', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) 
      });
    } catch (err) {
      console.error('Failed to subscribe', err);
    }

    setSubmitted(true);
    localStorage.setItem('newsletter_subscribed', 'true');

    // Auto-close after success message
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
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
              You're Subscribed!
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Thanks for joining. Watch your inbox for AI updates.
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
                  Get Weekly AI Tools
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Join 10,000+ builders staying ahead.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Subscribe Free
              </button>
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
