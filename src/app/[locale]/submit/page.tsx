import { SubmitToolForm } from '@/components/SubmitToolForm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'SubmitPage'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
        canonical: `/${locale}/submit`,
    }
  };
}

export default function SubmitPage() {
  return <SubmitToolForm />;
}
