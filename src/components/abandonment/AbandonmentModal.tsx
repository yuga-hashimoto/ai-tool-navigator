"use client";

import { useState, useEffect, useCallback } from "react";
import { useAbandonedLinkRecovery } from "@/hooks/useAbandonedLinkRecovery";

interface AbandonmentModalProps {
  toolSlug: string;
  toolName: string;
  affiliateId?: string;
  discountCode?: string;
  bonusValue?: string;
  showOnExitIntent?: boolean;
  showOnTimeout?: boolean;
  timeoutSeconds?: number;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  emailPlaceholder?: string;
}

export function AbandonmentModal({
  toolSlug,
  toolName,
  affiliateId,
  discountCode,
  bonusValue,
  showOnExitIntent = true,
  showOnTimeout = false,
  timeoutSeconds = 60,
  title = "Wait! Don't miss out...",
  subtitle = "Enter your email to unlock an exclusive offer and never lose your progress.",
  ctaText = "Get My Offer",
  emailPlaceholder = "Enter your email",
}: AbandonmentModalProps) {
  const {
    sessionId,
    captureEmail,
    openAbandonmentModal,
    closeAbandonmentModal,
    getRecoveryLink,
  } = useAbandonedLinkRecovery({
    toolSlug,
    toolName,
    affiliateId,
    enableExitIntent: showOnExitIntent,
    enableTimeout: showOnTimeout,
    timeoutSeconds,
  });

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Listen for modal open/close events
  useEffect(() => {
    const handleOpen = () => setIsVisible(true);
    const handleClose = () => setIsVisible(false);

    window.addEventListener("abandonment:modal:open", handleOpen);
    window.addEventListener("abandonment:modal:close", handleClose);

    return () => {
      window.removeEventListener("abandonment:modal:open", handleOpen);
      window.removeEventListener("abandonment:modal:close", handleClose);
    };
  }, []);

  // Auto-show after timeout if enabled
  useEffect(() => {
    if (showOnTimeout) {
      const timer = setTimeout(() => {
        openAbandonmentModal();
      }, timeoutSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [showOnTimeout, timeoutSeconds, openAbandonmentModal]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await captureEmail(email);

      if (success) {
        setIsSuccess(true);
      } else {
        setError("Failed to capture email. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, captureEmail]);

  const handleClose = useCallback(() => {
    closeAbandonmentModal();
    setIsVisible(false);
  }, [closeAbandonmentModal]);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-modal-enter">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success state */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h3>
            <p className="text-gray-600">
              Check your inbox for your exclusive recovery link.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-blue-100">{subtitle}</p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Benefits */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant access to {toolName}
                </li>
                {bonusValue && (
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {bonusValue} bonus included
                  </li>
                )}
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                {discountCode && (
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Code <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{discountCode}</span> applied
                  </li>
                )}
              </ul>

              {/* Email form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={emailPlaceholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      ctaText
                    )}
                  </button>
                </div>
              </form>

              {/* No thanks link */}
              <button
                onClick={handleClose}
                className="block w-full text-center text-sm text-gray-500 mt-4 hover:text-gray-700"
              >
                No thanks, I don't want to save my progress
              </button>
            </div>
          </>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AbandonmentModal;
