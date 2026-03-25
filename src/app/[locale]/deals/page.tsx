import { getAllTools } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { Suspense } from 'react';
import { generateBreadcrumbSchema } from "@/lib/schema";
import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'DealsPage'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/deals`,
    }
  };
}

export default async function DealsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations('DealsPage');
  const tBreadcrumbs = await getTranslations('Breadcrumbs');
  const tools = await getAllTools(locale);
  const deals = tools.filter(tool => tool.discount);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('deals') },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

        <div className="mx-auto mb-10 max-w-3xl">
          <AffiliateDisclaimer variant="compact" />
        </div>

        {deals.length > 0 ? (
          <Suspense fallback={<div className="py-12 text-center">Loading deals...</div>}>
            <ToolGrid tools={deals} />
          </Suspense>
        ) : (
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            No deals found at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
