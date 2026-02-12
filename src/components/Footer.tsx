import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col items-center md:items-end space-y-4 md:order-2">
          <div className="flex space-x-6">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
          <div className="flex space-x-6">
            <Link href="/submit" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t('submit')}
            </Link>
            <Link href="/sponsor" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t('sponsorship')}
            </Link>
            <Link href="/about" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t('about')}
            </Link>
            <Link href="/privacy" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t('terms')}
            </Link>
          </div>
        </div>
        <div className="mt-8 md:order-1 md:mt-0 space-y-2">
          <p className="text-center md:text-left text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} {t('rights')}
          </p>
          <p className="text-center md:text-left text-[10px] leading-4 text-zinc-500 dark:text-zinc-400 max-w-md">
            {t('disclosure')}
          </p>
        </div>
      </div>
    </footer>
  );
}
