import { getAllTools } from "@/lib/tools";
import { ToolsPageContent } from "@/components/ToolsPageContent";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Browse AI Tools",
    description: "Browse and discover the best AI tools for your workflow. Filter by category, rating, price, and more.",
    alternates: {
      canonical: `/${locale}/tools`,
    },
  };
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const tools = await getAllTools(locale);
  const t = await getTranslations('ToolsPage');

  const isElasticsearchEnabled = !!process.env.ELASTICSEARCH_URL;

  // Calculate facets for AdvancedSearch (or reuse for ToolsPageContent if we updated it, but we keep it as is)
  const categories = [...new Set(tools.map((tool) => tool.category))].sort();
  const allYears = [...new Set(tools.map((tool) => {
      if (tool.last_updated) {
        return new Date(tool.last_updated).getFullYear();
      }
      return new Date().getFullYear();
    }))].sort((a, b) => b - a);
  const platforms = ['Web', 'Mobile', 'Desktop'];

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t('description')}
          </p>
        </div>

        {isElasticsearchEnabled ? (
          <AdvancedSearch
            initialTools={tools}
            allCategories={categories}
            allYears={allYears}
            allPlatforms={platforms}
          />
        ) : (
          <ToolsPageContent tools={tools} />
        )}
      </div>
    </div>
  );
}
