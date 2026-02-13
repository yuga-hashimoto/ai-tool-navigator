import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import NewsletterManagement from '@/components/NewsletterManagement';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NewsletterPage' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <NewsletterManagement />
      </div>
    </div>
  );
}
