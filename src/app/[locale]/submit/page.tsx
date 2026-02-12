import { getTranslations } from 'next-intl/server';
import { SubmitForm } from '@/components/SubmitForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'SubmitPage' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `/${locale}/submit`,
        },
    };
}

export default async function SubmitPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SubmitPage' });

  return (
    <div className="bg-white dark:bg-black min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t('description')}
          </p>
        </div>

        <div className="mx-auto max-w-xl mt-10">
          <SubmitForm />
        </div>
      </div>
    </div>
  );
}
