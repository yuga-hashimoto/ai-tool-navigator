import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Github, Linkedin, Twitter } from 'lucide-react';
import FooterNewsletterForm from './FooterNewsletterForm';
import { ReferralSystem } from '@/components/ReferralSystem';

export function Footer() {
  const t = useTranslations('Footer');
  const tReferral = useTranslations('ReferralSystem');

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
             <FooterNewsletterForm />
          </div>
          <div className="mt-10 xl:mt-0 xl:col-span-1">
             <div className="flex flex-col items-center xl:items-end space-y-6">
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
