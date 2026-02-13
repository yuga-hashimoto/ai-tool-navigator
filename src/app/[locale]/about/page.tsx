import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema, generateAboutPageSchema } from "@/lib/schema";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'AboutPage'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/about`,
    }
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  // We need to await params to satisfy Next.js 15+ requirements,
  // even though we don't strictly need 'locale' if we use getTranslations w/o locale
  // but it's good practice.
  const { locale } = await params;
  const t = await getTranslations('AboutPage');
  const tBreadcrumbs = await getTranslations('Breadcrumbs');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('about') },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const aboutSchema = generateAboutPageSchema();

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t('description')}
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-16">
          <section>
             <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
               {t('mission_title')}
             </h2>
             <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">
               {t('mission_text')}
             </p>
          </section>

          <section>
             <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
               {t('values_title')}
             </h2>
             <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">
               {t('values_text')}
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
