import { useState, useEffect, useCallback } from 'react';

export interface SearchState {
  q: string;
  category: string[];
  rating: number | null;
  price: 'all' | 'free' | 'paid' | 'freemium';
  page: number;
}

export function useSearch(initialState: Partial<SearchState> = {}, locale: string = 'en') {
  const [state, setState] = useState<SearchState>({
    q: '',
    category: [],
    rating: null,
    price: 'all',
    page: 1,
    ...initialState,
  });

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [aggregations, setAggregations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      if (state.category.length > 0) params.set('category', state.category.join(','));
      if (state.rating) params.set('rating', state.rating.toString());
      if (state.price !== 'all') params.set('price', state.price);
      params.set('page', state.page.toString());
      params.set('locale', locale);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 503) {
            setError('Elasticsearch is not configured');
        } else {
            throw new Error('Search failed');
        }
        setResults([]);
        setTotal(0);
        setAggregations(null);
        return;
      }

      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
      setAggregations(data.aggregations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [state, locale]);

  // Debounce search execution
  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const setQuery = (q: string) => setState(prev => ({ ...prev, q, page: 1 }));
  const setCategory = (category: string[]) => setState(prev => ({ ...prev, category, page: 1 }));
  const setRating = (rating: number | null) => setState(prev => ({ ...prev, rating, page: 1 }));
  const setPrice = (price: 'all' | 'free' | 'paid' | 'freemium') => setState(prev => ({ ...prev, price, page: 1 }));
  const setPage = (page: number) => setState(prev => ({ ...prev, page }));
  const clearFilters = () => setState(prev => ({ ...prev, category: [], rating: null, price: 'all', page: 1 }));

  return {
    state,
    results,
    total,
    aggregations,
    loading,
    error,
    setQuery,
    setCategory,
    setRating,
    setPrice,
    setPage,
    clearFilters
  };
}
