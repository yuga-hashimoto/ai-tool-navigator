"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sendGAEvent } from '@/lib/analytics';

export function HeroSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('ToolGrid');
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    // Update URL without page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    if (searchTerm) {
      sendGAEvent('search', { search_term: searchTerm });
    }

    // Scroll to results if needed
    const toolGrid = document.getElementById('tool-grid');
    if (toolGrid) {
      // Small offset for sticky header if exists, though not strictly required
      const yOffset = -100;
      const y = toolGrid.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mt-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-4 text-base shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
            Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionRef} className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 flex items-center"
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  <Search className="inline-block w-4 h-4 mr-2 text-zinc-400" />
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
