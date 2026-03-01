'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Mail, CheckCircle, Gift, Zap, Globe, Loader2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sendGAEvent, trackExitIntentEvent } from '@/lib/analytics';
import { hashEmail } from '@/lib/security/email-hashing';
import { 
  useExitIntentModal, 
  getExitIntentContent, 
  type GeoOfferConfig 
} from '@/hooks/useExitIntent';
import { getCountryFlag, getTimeBasedGreeting, type GeoLocation } from '@/lib/geo-targeting';

interface ExitIntentModalProps {
  variant?: 'default' | 'urgent' | 'bonus';
  enabled?: boolean;
  delay?: number;
  maxShows?: number;
}

export default function ExitIntentModalEnhanced({
  variant: propVariant,
  enabled = true,
  delay = 300,
  maxShows = 3,
}: ExitIntentModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const t = useTranslations('ExitIntentModal');

  const {
    isVisible,
    variant: abVariant,
    geoOffer,
    hideModal,
    handleConversion,
    handleClose,
  } = useExitIntentModal({
    enabled,
    delay,
    maxShows,
  });

  const variant = propVariant || abVariant;
  const content = getExitIntentContent(variant, geoOffer);
  const geoLocation: GeoLocation | null = geoOffer ? {
    countryCode: geoOffer.countryCodes[0] || 'XX',
    countryName: 'Localized',
    isEU: false,
  } : null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const hashedEmail = await hashEmail(email);

      const response = await fetch('/api/leads/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: hashedEmail,
          original_email_hash: hashedEmail,
          variant,
          source: 'exit_intent_modal',
          geo_country: geoOffer?.countryCodes[0] || 'unknown',
          geo_offer_code: geoOffer?.discountCode || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
      await handleConversion(email);
      
      sendGAEvent('exit_intent_signup', {
        variant,
        method: 'exit_intent_modal',
        geo_offer: geoOffer?.discountCode || 'none',
      });

      setTimeout(() => {
        hideModal();
      }, 3000);
    } catch (err) {
      console.error('Exit intent submission error:', err);
      setError(t('error') || 'Something went wrong. Please try again.');
      trackExitIntentEvent('error', {
        variant,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-300">
          <button
            onClick={hideModal}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('successTitle') || 'You\'re In!'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {geoOffer?.discountCode 
                ? `Use code ${geoOffer.discountCode} at checkout`
                : t('successSubtitle') || 'Check your inbox for exclusive content'}
            </p>
            {geoOffer?.discountPercent && (
              <div className="mt-4 rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  🎉 {geoOffer.discountPercent}% Discount Applied!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label={t('close') || 'Close'}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {geoOffer && (
          <div className="absolute right-16 top-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Globe className="h-3.5 w-3.5" />
            <span>{getCountryFlag(geoOffer.countryCodes[0] || 'XX')} Special Offer</span>
          </div>
        )}

        <div className="p-6 pt-8">
          <div id="exit-intent-title" className="sr-only">
            {content.headline}
          </div>

          <div className="mb-6 flex flex-col items-center text-center">
            <div className={`mb-4 rounded-full p-4 ${content.style.iconBg}`}>
              {content.icon === 'mail' && <Mail className={`h-10 w-10 ${content.style.iconColor}`} />}
              {content.icon === 'zap' && <Zap className={`h-10 w-10 ${content.style.iconColor}`} />}
              {content.icon === 'gift' && <Gift className={`h-10 w-10 ${content.style.iconColor}`} />}
            </div>
            
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              {geoLocation ? getTimeBasedGreeting(geoLocation) : 'Welcome'}!
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {content.headline}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {content.subtitle}
            </p>

            {geoOffer?.discountPercent && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-1.5 text-sm font-medium text-green-700 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">
                  {geoOffer.discountPercent}%
                </span>
                {geoOffer.discountCode && <span>Code: {geoOffer.discountCode}</span>}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder={t('placeholder') || 'Enter your email'}
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
              className={`group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${content.style.button}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('submitting') || 'Submitting...'}
                </span>
              ) : (
                <>
                  {content.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              <span>No spam, unsubscribe anytime</span>
              <span className="mx-1">•</span>
              <span>{geoOffer?.discountCode ? 'Limited time offer' : 'Exclusive content'}</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
