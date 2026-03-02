"use client";

import { useState, useCallback, useEffect } from 'react';

interface AvailabilityCache {
  [toolSlug: string]: boolean | undefined;
}

interface AvailabilityEntry {
  timestamp: number;
  available: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const API_CACHE_KEY = 'availability_cache';

export function useAvailability() {
  const [availabilityCache, setAvailabilityCache] = useState<AvailabilityCache>({});

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(API_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Record<string, AvailabilityEntry>;
        const now = Date.now();
        
        // Filter out expired entries
        const validEntries: AvailabilityCache = {};
        Object.entries(parsed).forEach(([key, entry]) => {
          if (now - entry.timestamp < CACHE_DURATION) {
            validEntries[key] = entry.available;
          }
        });
        
        setAvailabilityCache(validEntries);
      }
    } catch (error) {
      console.error('Failed to load availability cache:', error);
    }
  }, []);

  // Save cache to localStorage when it changes
  useEffect(() => {
    try {
      const toSave: Record<string, AvailabilityEntry> = {};
      Object.entries(availabilityCache).forEach(([key, available]) => {
        if (available !== undefined) {
          toSave[key] = {
            timestamp: Date.now(),
<<<<<<< HEAD
            available: available as boolean,
=======
            available,
>>>>>>> origin/main
          };
        }
      });
      localStorage.setItem(API_CACHE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save availability cache:', error);
    }
  }, [availabilityCache]);

  const checkAvailability = useCallback(async (toolSlug: string): Promise<boolean | undefined> => {
    // Return cached value if available and not expired
    if (availabilityCache[toolSlug] !== undefined) {
      return availabilityCache[toolSlug];
    }

    try {
      // In production, this would call an actual API
      // const response = await fetch(`/api/availability/${toolSlug}`);
      // const data = await response.json();
      // const available = data.available;

      // For now, simulate availability check
      const available = Math.random() > 0.1; // 90% availability for demo

      // Update cache
      setAvailabilityCache(prev => ({
        ...prev,
        [toolSlug]: available,
      }));

      return available;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return undefined;
    }
  }, [availabilityCache]);

  const checkMultipleAvailability = useCallback(async (toolSlugs: string[]): Promise<Record<string, boolean | undefined>> => {
    const results: Record<string, boolean | undefined> = {};
    const uncachedSlugs: string[] = [];

    // Check cache first
    toolSlugs.forEach(slug => {
      if (availabilityCache[slug] !== undefined) {
        results[slug] = availabilityCache[slug];
      } else {
        uncachedSlugs.push(slug);
      }
    });

    // Fetch uncached items in parallel
    if (uncachedSlugs.length > 0) {
      await Promise.all(
        uncachedSlugs.map(async (slug) => {
          const available = await checkAvailability(slug);
          results[slug] = available;
        })
      );
    }

    return results;
  }, [availabilityCache, checkAvailability]);

  const clearCache = useCallback(() => {
    setAvailabilityCache({});
    localStorage.removeItem(API_CACHE_KEY);
  }, []);

  const refreshAvailability = useCallback(async (toolSlug: string): Promise<boolean | undefined> => {
    // Force refresh by removing from cache first
    setAvailabilityCache(prev => {
      const next = { ...prev };
      delete next[toolSlug];
      return next;
    });
    
    return checkAvailability(toolSlug);
  }, [checkAvailability]);

  return {
    availabilityCache,
    checkAvailability,
    checkMultipleAvailability,
    clearCache,
    refreshAvailability,
  };
}
