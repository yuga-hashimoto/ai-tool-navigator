import { useState, useEffect, useCallback } from 'react';
import { SearchOptions, SearchResult } from '@/lib/search';

export function useSearch(initialOptions: SearchOptions = {}) {
  const [options, setOptions] = useState<SearchOptions>(initialOptions);
  const [results, setResults] = useState<SearchResult<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (opts: SearchOptions) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.q) params.set('q', opts.q);
      if (opts.page) params.set('page', opts.page.toString());
      if (opts.limit) params.set('limit', opts.limit.toString());
      if (opts.sort) params.set('sort', opts.sort);

      if (opts.filters) {
        if (opts.filters.category) {
            opts.filters.category.forEach(c => params.append('category', c));
        }
        if (opts.filters.price) params.set('price', opts.filters.price);
        if (opts.filters.platform) {
            opts.filters.platform.forEach(p => params.append('platform', p));
        }
        if (opts.filters.rating) params.set('rating', opts.filters.rating.toString());
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // If error (e.g. connection refused), maybe set empty results or keep previous?
      // For now, let's keep previous results but show error, or clear if critical.
      // But clearing results might be jarring.
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(options);
    }, 300);
    return () => clearTimeout(timer);
  }, [options, fetchResults]);

  const updateOption = useCallback((key: keyof SearchOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilter = useCallback((key: string, value: any) => {
    setOptions(prev => ({
        ...prev,
        filters: {
            ...prev.filters,
            [key]: value
        },
        page: 1 // Reset page on filter change
    }));
  }, []);

  return {
    options,
    setOptions,
    updateOption,
    updateFilter,
    results,
    loading,
    error,
    refresh: () => fetchResults(options)
  };
}
