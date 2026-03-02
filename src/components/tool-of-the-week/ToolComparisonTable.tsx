/**
 * ToolComparisonTable Component
 * 
 * A comparison table for highlighting tool differences.
 */

"use client";

import { ToolMetadata } from '@/lib/tools';
import { Star, Check, X, Minus } from 'lucide-react';
import { Rating } from '@/components/Rating';
import Link from 'next/link';
import Image from 'next/image';

interface ComparisonFeature {
  label: string;
  getValue: (tool: ToolMetadata) => string | boolean | number;
  highlight?: boolean;
}

interface ToolComparisonTableProps {
  tools: ToolMetadata[];
  title?: string;
  features?: ComparisonFeature[];
  showRating?: boolean;
  showPrice?: boolean;
  highlightTool?: string; // slug of tool to highlight
  className?: string;
}

export function ToolComparisonTable({
  tools,
  title = 'Tool Comparison',
  features = [],
  showRating = true,
  showPrice = true,
  highlightTool,
  className = '',
}: ToolComparisonTableProps) {
  const defaultFeatures: ComparisonFeature[] = [
    {
      label: 'Rating',
      getValue: (tool) => tool.rating,
      highlight: true,
    },
    {
      label: 'Category',
      getValue: (tool) => tool.category,
    },
    {
      label: 'Free Tier',
      getValue: (tool) => tool.pricing === 'free' || tool.pricing === 'freemium',
    },
    {
      label: 'Commercial Use',
      getValue: (tool) => true, // Assume commercial use available
    },
    {
      label: 'Easy to Use',
      getValue: (tool) => tool.rating >= 4.5 ? 'Excellent' : tool.rating >= 4 ? 'Good' : 'Fair',
    },
  ];

  const allFeatures = features.length > 0 ? features : defaultFeatures;

  const renderValue = (value: string | boolean | number, isHighlight: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-500 mx-auto" />
      );
    }
    
    if (typeof value === 'number' && isHighlight) {
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="font-bold">{value.toFixed(1)}</span>
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      );
    }
    
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900/50">
            <th className="text-left p-4 font-semibold text-zinc-900 dark:text-white">
              {title}
            </th>
            {tools.map((tool) => (
              <th
                key={tool.slug}
                className={`text-center p-4 font-semibold ${
                  highlightTool === tool.slug
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'text-zinc-900 dark:text-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {tool.image && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={tool.image}
                        alt={tool.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-lg">{tool.title}</span>
                  {highlightTool === tool.slug && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      Top Pick
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {allFeatures.map((feature, idx) => (
            <tr
              key={feature.label}
              className={idx % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50 dark:bg-zinc-900/20'}
            >
              <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {feature.label}
              </td>
              {tools.map((tool) => (
                <td
                  key={tool.slug}
                  className={`p-4 text-center ${
                    highlightTool === tool.slug
                      ? 'bg-purple-50/50 dark:bg-purple-900/10'
                      : ''
                  }`}
                >
                  {renderValue(feature.getValue(tool), feature.highlight)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-zinc-50 dark:bg-zinc-900/50">
            <td className="p-4"></td>
            {tools.map((tool) => (
              <td key={tool.slug} className="p-4 text-center">
                <Link
                  href={`/tools/${tool.slug}`}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    highlightTool === tool.slug
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
                  }`}
                >
                  {highlightTool === tool.slug ? 'Try Now' : 'View Details'}
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
