import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import FooterNewsletterForm from './FooterNewsletterForm';
import { ReferralSystem } from '@/components/ReferralSystem';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations('Footer');
  const tReferral = useTranslations('ReferralSystem');
  const copy = locale === 'ja'
    ? {
        affiliateDisclosure: '広告開示',
        editorialPolicy: '編集方針',
      }
    : {
        affiliateDisclosure: 'Affiliate Disclosure',
        editorialPolicy: 'Editorial Policy',
      };

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
             <FooterNewsletterForm />
          </div>
          <div className="mt-10 xl:mt-0 xl:col-span-1">
             <div className="flex flex-col items-center xl:items-end space-y-6">
                <div className="max-w-md text-center xl:text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {locale === 'ja' ? '独立系のAIツール比較メディア' : 'Independent AI tool research and comparison'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {locale === 'ja'
                        ? '編集方針と広告開示を明示し、主要カテゴリ・比較・詳細レビューを横断して調べられる構成にしています。'
                        : 'Browse category hubs, comparison pages, and detailed reviews with clear editorial standards and affiliate disclosure.'}
                    </p>
                </div>
                <div className="flex flex-wrap justify-center xl:justify-end gap-x-6 gap-y-2">
                    <ReferralSystem
                        trigger={
                            <button className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                                {tReferral('trigger')}
                            </button>
                        }
                    />
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
                    <Link href="/affiliate-disclosure" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    {copy.affiliateDisclosure}
                    </Link>
                    <Link href="/editorial-policy" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    {copy.editorialPolicy}
                    </Link>
                </div>
             </div>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <p className="text-center text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} {t('rights')}
          </p>
          <p className="mt-2 text-center text-[10px] leading-4 text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto">
            {t('disclosure')}
          </p>
        </div>
      </div>
    </footer>
  );
}
