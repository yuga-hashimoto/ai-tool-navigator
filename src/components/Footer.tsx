import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/sponsor" className="text-zinc-500 hover:text-zinc-400">
            {t('sponsorship')}
          </Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-400">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-400">
            {t('terms')}
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0 space-y-2">
          <p className="text-center md:text-left text-xs leading-5 text-zinc-500">
            &copy; {new Date().getFullYear()} {t('rights')}
          </p>
          <p className="text-center md:text-left text-[10px] leading-4 text-zinc-400 max-w-md">
            {t('disclosure')}
          </p>
        </div>
      </div>
    </footer>
  );
}
