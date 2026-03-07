"use client";

import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useState } from "react";

interface AffiliateDisclaimerProps {
  variant?: "compact" | "full" | "inline";
  className?: string;
}

export function AffiliateDisclaimer({
  variant = "compact",
  className = "",
}: AffiliateDisclaimerProps) {
  const locale = useLocale();
  const [dismissed, setDismissed] = useState(false);
  const copy = locale === "ja"
    ? {
        inline: "当サイトのリンク経由で申込みや購入があると、紹介料を受け取る場合があります。",
        title: "広告・アフィリエイト開示",
        intro:
          "このサイトの一部リンクはアフィリエイトリンクです。リンク経由で申込みや購入があると、当サイトに報酬が支払われる場合があります。",
        trustHeading: "判断基準について",
        trustPoints: [
          "比較や掲載順位は報酬率ではなく、用途適合と編集基準を優先します。",
          "確認が不十分な名称やページは主要導線とインデックスから外します。",
          "収益リンクは明示し、編集方針と分けて説明します。",
        ],
        support:
          "リンク経由の収益は、比較コンテンツの更新、検証、運営コストの一部に充てています。",
        dismiss: "閉じる",
        compact: "当サイトのリンク経由で紹介料を受け取る場合があります。",
        learnMore: "詳細を見る",
        dismissAria: "広告開示を閉じる",
        optOut: "アフィリエイト計測を無効化",
        optedOut: "アフィリエイト計測を無効化しました",
      }
    : {
        inline: "We may earn a commission when you use our links. This supports our research.",
        title: "Affiliate Disclosure",
        intro:
          "Some links on this site are affiliate links. If you sign up or purchase through them, we may earn a commission at no extra cost to you.",
        trustHeading: "How we keep recommendations credible",
        trustPoints: [
          "We prioritize product fit and editorial standards over commission rates.",
          "Names or pages that fail review are removed from primary entry points and indexing.",
          "Revenue links are disclosed separately from our editorial policy.",
        ],
        support:
          "Affiliate revenue helps fund ongoing research, comparison updates, and site operations.",
        dismiss: "Dismiss",
        compact: "We may earn a commission when you use our links.",
        learnMore: "Learn more",
        dismissAria: "Dismiss affiliate disclosure",
        optOut: "Opt out of affiliate tracking",
        optedOut: "You have opted out of affiliate tracking",
      };

  if (dismissed) return null;

  if (variant === "inline") {
    return (
      <span className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        * {copy.inline}
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 ${className}`}
      >
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          {copy.title}
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          {copy.intro}
        </p>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
          <strong>{copy.trustHeading}</strong>
        </p>
        <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 text-sm space-y-2 mb-4">
          {copy.trustPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="text-blue-600 dark:text-blue-400 text-xs">
          {copy.support}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
        >
          {copy.dismiss}
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
        {copy.compact}
        <Link
          href="/affiliate-disclosure"
          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          {copy.learnMore}
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
        aria-label={copy.dismissAria}
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
  const locale = useLocale();
  const [optedOut, setOptedOut] = useState(false);
  const copy = locale === "ja"
    ? {
        optedOut: "アフィリエイト計測を無効化しました",
        button: "アフィリエイト計測を無効化",
      }
    : {
        optedOut: "You have opted out of affiliate tracking",
        button: "Opt out of affiliate tracking",
      };

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
        {copy.optedOut}
      </div>
    );
  }

  return (
    <button
      onClick={handleOptOut}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
    >
      {copy.button}
    </button>
  );
}
