'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white dark:bg-black px-4 text-center">
      <div className="space-y-4 max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {t('title')}
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-400">
          {t('description')}
        </p>

        <form onSubmit={handleSearch} className="relative mt-6 max-w-sm mx-auto">
            <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Search className="h-4 w-4" />
            </button>
        </form>

        <div className="pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            {t('home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
