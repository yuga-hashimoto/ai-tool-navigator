'use client';

import React from 'react';
import { ArrowRight, BarChart3, Star, Clock, Users } from 'lucide-react';
import { EnhancedAffiliateCTA } from './EnhancedAffiliateCTA';

interface ToolForComparison {
  slug: string;
  name: string;
  description?: string;
  rating: number;
  pricing?: string;
  affiliateUrl?: string;
  affiliateId?: string;
  features?: string[];
  pros?: string[];
  users?: number;
}

interface ComparisonCTABlockProps {
  tools: ToolForComparison[];
  title?: string;
  description?: string;
  showComparison?: boolean;
  layout?: 'horizontal' | 'vertical' | 'cards';
}

export function ComparisonCTABlock({
  tools,
  title = 'Ready to Choose?',
  description,
  showComparison = true,
  layout = 'cards',
}: ComparisonCTABlockProps) {
  // Sort by rating
  const sortedTools = [...tools].sort((a, b) => b.rating - a.rating);
  const topPick = sortedTools[0];

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Top Pick Highlight */}
      {topPick && (
        <div className="relative mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            ⭐ TOP PICK
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {topPick.name}
                </h3>
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    {topPick.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              
              {topPick.pricing && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {topPick.pricing}
                </p>
              )}
              
              {topPick.features && topPick.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {topPick.features.slice(0, 3).map((feature, i) => (
                    <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <EnhancedAffiliateCTA
              href={topPick.affiliateUrl || '#'}
              toolSlug={topPick.slug}
              toolName={topPick.name}
              affiliateId={topPick.affiliateId}
              ctaText={`Try ${topPick.name}`}
              variant="popular"
              showSocialProof={true}
              showUrgency={true}
              ratings={topPick.rating}
              users={topPick.users ? `${(topPick.users / 1000).toFixed(0)}K+` : undefined}
              position="comparison_block_top_pick"
              source="comparison_cta"
              campaign="tool_comparison_2026"
            />
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      {showComparison && layout === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTools.slice(0, 6).map((tool, index) => (
            <div
              key={tool.slug}
              className={`relative p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                index === 0
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 text-xs font-bold text-gray-400 dark:text-gray-500">
                #{index + 1}
              </div>
              
              {/* Tool Info */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {tool.name}
                  </h4>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {tool.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                {tool.pricing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                    {tool.pricing}
                  </p>
                )}
                
                {/* Quick Pros */}
                {tool.pros && tool.pros.length > 0 && (
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mb-4 space-y-1">
                    {tool.pros.slice(0, 2).map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="truncate">{pro}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* CTA Button */}
                <EnhancedAffiliateCTA
                  href={tool.affiliateUrl || '#'}
                  toolSlug={tool.slug}
                  toolName={tool.name}
                  affiliateId={tool.affiliateId}
                  ctaText="View Details"
                  variant={index === 0 ? 'popular' : 'default'}
                  showSocialProof={false}
                  ratings={tool.rating}
                  className="w-full"
                  position={`comparison_card_${index + 1}`}
                  source="comparison_cta"
                  campaign="tool_comparison_2026"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Comparison Table */}
      {showComparison && layout === 'horizontal' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Tool
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Rating
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Pricing
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTools.slice(0, 5).map((tool, index) => (
                <tr key={tool.slug} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tool.name}
                    </span>
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                        Top Pick
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {tool.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    {tool.pricing || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <EnhancedAffiliateCTA
                      href={tool.affiliateUrl || '#'}
                      toolSlug={tool.slug}
                      toolName={tool.name}
                      affiliateId={tool.affiliateId}
                      ctaText={index === 0 ? 'Get Started' : 'View'}
                      variant={index === 0 ? 'popular' : 'default'}
                      ratings={tool.rating}
                      className="inline-flex"
                      position={`comparison_table_row_${index + 1}`}
                      source="comparison_table"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4" />
          <span>Data-driven recommendations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Updated daily</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{(Math.floor(Math.random() * 50) + 50)}K+ users this month</span>
        </div>
      </div>
    </div>
  );
}

export default ComparisonCTABlock;
