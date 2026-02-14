"use client";

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Menu, X, Search } from 'lucide-react';
import { CATEGORY_MAPPINGS } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navigation({ className }: { className?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('Navigation');
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={cn("border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white hover:opacity-80 transition-opacity">
              AI Tool Navigator
            </Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('home')}
              </Link>
              <Link href="/tools" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('tools')}
              </Link>
              <Link href="/videos" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('videos')}
              </Link>
              <Link href="/deals" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('deals')}
              </Link>
              <Link href="/blog" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('blog')}
              </Link>
              <Link href="/about" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('about')}
              </Link>
              <ThemeToggle />
              <Link href="/submit" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                {t('submit_cta')}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              aria-label={isMenuOpen ? t('close') : t('menu')}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-black",
          isMenuOpen ? "max-h-screen opacity-100 border-b border-zinc-200 dark:border-zinc-800" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-4 space-y-4">
           {/* Search */}
           <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
           </form>

           {/* Main Links */}
           <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                href="/tools"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('tools')}
              </Link>
              <Link
                href="/videos"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('videos')}
              </Link>
              <Link
                href="/deals"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('deals')}
              </Link>
              <Link
                href="/blog"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('blog')}
              </Link>
              <Link
                href="/about"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <Link
                href="/submit"
                className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('submit_cta')}
              </Link>
           </div>

           {/* Categories */}
           <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
             <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2 px-2">
               {t('categories')}
             </h3>
             <div className="flex flex-col gap-1">
               {Object.keys(CATEGORY_MAPPINGS).map((slug) => (
                 <Link
                   key={slug}
                   href={`/category/${slug}`}
                   className="block py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-2 rounded-md transition-colors"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   {t(slug)}
                 </Link>
               ))}
             </div>
           </div>
        </div>
      </div>
    </nav>
  );
}
