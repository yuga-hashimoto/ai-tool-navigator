"use client";

import { useState } from "react";

interface AffiliateDisclaimerProps {
  variant?: "compact" | "full" | "inline";
  className?: string;
}

export function AffiliateDisclaimer({
  variant = "compact",
  className = "",
}: AffiliateDisclaimerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "inline") {
    return (
      <span className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        * We may earn a commission when you use our links. This supports our research.
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Affiliate Disclosure
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Some of the links on this website are affiliate links, which means we
          may earn a commission if you click through and make a purchase. This
          comes at no additional cost to you.
        </p>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
          <strong>Why trust our recommendations?</strong>
        </p>
        <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 text-sm space-y-2 mb-4">
          <li>We only recommend tools we've personally tested and use</li>
          <li>Our recommendations are based on merit, not commission rates</li>
          <li>Transparency is core to our values</li>
        </ul>
        <p className="text-blue-600 dark:text-blue-400 text-xs">
          By using our affiliate links, you support our research and help keep
          our content free. Thank you for your support!
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div
      className={`text-center text-sm text-gray-500 dark:text-gray-400 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg ${className}`}
    >
      <p>
        We may earn a commission when you use our links.
        <a
          href="/affiliate-disclosure"
          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Learn more
        </a>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
        aria-label="Dismiss affiliate disclosure"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Affiliate opt-out component for privacy compliance
 */
export function AffiliateOptOut() {
  const [optedOut, setOptedOut] = useState(false);

  const handleOptOut = () => {
    // Clear all affiliate tracking cookies
    if (typeof document !== "undefined") {
      document.cookie = "affiliate_attribution=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = "affiliate_clicks=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    setOptedOut(true);
    
    // Send opt-out event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("affiliate-opt-out"));
    }
  };

  if (optedOut) {
    return (
      <div className="text-green-600 dark:text-green-400 text-sm">
        ✓ You have opted out of affiliate tracking
      </div>
    );
  }

  return (
    <button
      onClick={handleOptOut}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
    >
      Opt out of affiliate tracking
    </button>
  );
}
