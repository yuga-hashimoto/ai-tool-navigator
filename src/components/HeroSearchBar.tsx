"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('ToolGrid');
  const [query, setQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    // Update URL without page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // Scroll to results if needed
    const toolGrid = document.getElementById('tool-grid');
    if (toolGrid) {
      // Small offset for sticky header if exists, though not strictly required
      const yOffset = -100;
      const y = toolGrid.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mt-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-4 text-base shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
            Search
        </button>
      </div>
    </form>
  );
}
