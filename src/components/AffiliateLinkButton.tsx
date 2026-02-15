"use client";

import { sendGAEvent } from "@/lib/analytics";
import {
  recordAffiliateClick,
  recordAffiliateImpression,
  buildAffiliateUrl,
  hasTrackingOptOut,
} from "@/lib/affiliate-tracking";
import { ReactNode, useEffect, useState } from "react";
import affiliates from '../../data/affiliates.json';

interface AffiliateLinkButtonProps {
  href: string;
  toolSlug: string;
  toolName: string;
  affiliateId?: string;
  className?: string;
  children: ReactNode;
  position?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  trackImpression?: boolean;
  onClick?: () => void;
}

export function AffiliateLinkButton({
  href,
  toolSlug,
  toolName,
  affiliateId,
  className,
  children,
  position = "tool_page",
  source = "ai-tools-navigator",
  medium = "affiliate",
  campaign,
  content,
  term,
  trackImpression = false,
  onClick,
}: AffiliateLinkButtonProps) {
  const [trackingUrl, setTrackingUrl] = useState(href);
  const [recorded, setRecorded] = useState(false);

  // Build tracking URL with UTM parameters
  useEffect(() => {
    if (affiliateId) {
      setTrackingUrl(
        buildAffiliateUrl(href, {
          affiliateId,
          source,
          medium,
          campaign,
          content,
          term,
        })
      );
    }
  }, [href, affiliateId, source, medium, campaign, content, term]);

  // Record impression on mount (if enabled)
  useEffect(() => {
    if (trackImpression && !hasTrackingOptOut()) {
      const id = affiliateId || extractAffiliateId(href) || "unknown";
      recordAffiliateImpression(toolSlug, toolName, id, position);
    }
  }, [toolSlug, toolName, affiliateId, position, trackImpression]);

  const handleClick = async () => {
    // Don't track if user has opted out
    if (hasTrackingOptOut()) {
      onClick?.();
      return;
    }

    // Get the actual affiliate ID to use
    const id = affiliateId || extractAffiliateId(href) || "unknown";

    // Record the click
    recordAffiliateClick({
      toolSlug,
      toolName,
      affiliateId: id,
      source,
      medium,
      campaign,
      content,
      term,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      position,
    });

    // Call custom onClick handler
    onClick?.();

    setRecorded(true);
  };

  return (
    <a
      href={trackingUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={handleClick}
      data-affiliate-id={affiliateId || extractAffiliateId(href)}
      data-tool-slug={toolSlug}
    >
      {children}
    </a>
  );
}

/**
 * Extract affiliate ID from URL
 */
function extractAffiliateId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const ref = urlObj.searchParams.get("ref");
    if (ref) return ref;
    const affiliate = urlObj.searchParams.get("affiliate");
    if (affiliate) return affiliate;
    const pathMatch = urlObj.pathname.match(/\/ref\/([^/?#]+)/);
    if (pathMatch) return pathMatch[1];
    return null;
  } catch {
    return null;
  }
}

type Affiliate = {
  id: string;
  name: string;
  description: string;
  url: string;
  cta: string;
  tags?: string[];
};

const AffiliateSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Recommended Tools for 2026
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Supercharge your workflow with our top-rated AI and development tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {affiliates.map((tool: Affiliate) => (
            <div 
              key={tool.id} 
              className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  {tool.tags && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {tool.tags[0]}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1">
                  {tool.description}
                </p>
                <AffiliateLinkButton
                  href={tool.url}
                  toolSlug={tool.id}
                  toolName={tool.name}
                  affiliateId={tool.id}
                  position="recommended_tools"
                  source="affiliate_section"
                  campaign="tool_recommendations_2026"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {tool.cta}
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </AffiliateLinkButton>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>We may earn a commission when you use our links. This supports our research.</p>
        </div>
      </div>
    </section>
  );
};

export default AffiliateSection;
