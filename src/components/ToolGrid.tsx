"use client";

import { useState } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { ToolCard } from './ToolCard';
import { cn } from '@/lib/utils';

interface ToolGridProps {
  tools: ToolMetadata[];
}

export function ToolGrid({ tools }: ToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive categories from tools
  const categories = ['All', ...Array.from(new Set(tools.map((tool) => tool.category)))];

  const filteredTools = selectedCategory === 'All'
    ? tools
    : tools.filter((tool) => tool.category === selectedCategory);

  return (
    <div>
        <div className="mb-8 flex flex-wrap gap-2 justify-center sm:justify-start">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                        selectedCategory === category
                            ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                            : "border-transparent bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    )}
                >
                    {category}
                </button>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
                <div key={tool.slug} className="flex flex-col h-full">
                   <ToolCard tool={tool} />
                </div>
            ))}
        </div>
        {filteredTools.length === 0 && (
            <div className="py-12 text-center">
                <p className="text-zinc-500 dark:text-zinc-400">No tools found in this category.</p>
            </div>
        )}
    </div>
  );
}
