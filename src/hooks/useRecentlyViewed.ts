"use client";

import { useState, useEffect, useCallback } from 'react';
import { ToolMetadata } from '@/lib/tools';

const STORAGE_KEY = 'recently_viewed_tools';
const MAX_ITEMS = 10;
const EXPIRATION_DAYS = 30;

export interface RecentlyViewedTool {
  slug: string;
  title: string;
  category: string;
  image?: string;
  rating: number;
  viewedAt: number;
}

interface UseRecentlyViewedReturn {
  recentTools: RecentlyViewedTool[];
  addTool: (tool: ToolMetadata) => void;
  removeTool: (slug: string) => void;
  clearAll: () => void;
  isLoading: boolean;
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [recentTools, setRecentTools] = useState<RecentlyViewedTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedTool[];
        const now = Date.now();
        
        // Filter out expired entries
        const expirationMs = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
        const validTools = parsed.filter(
          (tool) => now - tool.viewedAt < expirationMs
        );

        setRecentTools(validTools);
        
        // Clean up storage if needed
        if (validTools.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validTools));
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed tools:', error);
    }

    setIsLoading(false);
  }, []);

  // Save to localStorage whenever tools change
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentTools));
    } catch (error) {
      console.error('Error saving recently viewed tools:', error);
    }
  }, [recentTools, isLoading]);

  const addTool = useCallback((tool: ToolMetadata) => {
    setCurrentTools((current) => {
      // Remove if already exists (to move to front)
      const filtered = current.filter((t) => t.slug !== tool.slug);
      
      // Create new entry
      const newEntry: RecentlyViewedTool = {
        slug: tool.slug,
        title: tool.title,
        category: tool.category,
        image: tool.image,
        rating: tool.rating,
        viewedAt: Date.now(),
      };

      // Add to front and limit to MAX_ITEMS
      const updated = [newEntry, ...filtered].slice(0, MAX_ITEMS);
      return updated;
    });
  }, []);

  const removeTool = useCallback((slug: string) => {
    setCurrentTools((current) => current.filter((t) => t.slug !== slug));
  }, []);

  const clearAll = useCallback(() => {
    setRecentTools([]);
  }, []);

  // Use function updater pattern to avoid dependency issues
  const setCurrentTools = useCallback((updater: (current: RecentlyViewedTool[]) => RecentlyViewedTool[]) => {
    setRecentTools((current) => updater(current));
  }, []);

  return {
    recentTools,
    addTool,
    removeTool,
    clearAll,
    isLoading,
  };
}

/**
 * Hook to track tool views with automatic recording
 * Use this in tool detail pages to automatically track views
 */
export function useTrackToolView(tool: ToolMetadata | null) {
  const { addTool } = useRecentlyViewed();

  useEffect(() => {
    if (tool) {
      addTool(tool);
    }
  }, [tool, addTool]);
}

/**
 * Hook to get tools sorted by category
 */
export function useRecentToolsByCategory() {
  const { recentTools } = useRecentlyViewed();

  const byCategory = recentTools.reduce<Record<string, RecentlyViewedTool[]>>(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {}
  );

  return byCategory;
}
