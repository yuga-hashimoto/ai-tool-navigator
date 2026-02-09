import { getAllTools } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";
import { getTranslations } from 'next-intl/server';
import { notFound } from "next/navigation";

// Define the valid slugs and their mapping to actual categories
const CATEGORY_MAPPINGS = {
  video: ['Video Generation'],
  writing: ['Writing', 'Copywriting'],
  coding: ['Code', 'Coding', 'Coding Agent'],
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAPPINGS).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    
     // Validate slug for metadata as well
    if (!Object.keys(CATEGORY_MAPPINGS).includes(slug)) {
        return {
            title: 'Category Not Found',
        };
    }

    const t = await getTranslations({locale, namespace: 'CategoryPage'});
    
    // Type assertion or safe access
    const titleKey = `${slug}_title` as any; 
    const descriptionKey = `${slug}_description` as any;
    
    const title = t(titleKey);
    const description = t(descriptionKey);

    return {
        title: `${title} - AI Tool Navigator`,
        description: description,
    }
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params;
  
  // Validate slug
  if (!Object.keys(CATEGORY_MAPPINGS).includes(slug)) {
    notFound();
  }

  const t = await getTranslations('CategoryPage');
  
  // Get the categories for the current slug
  const targetCategories = CATEGORY_MAPPINGS[slug as keyof typeof CATEGORY_MAPPINGS];
  
  // Fetch all tools and filter
  const tools = getAllTools(locale);
  const filteredTools = tools.filter((tool) => 
    targetCategories.includes(tool.category)
  );

  // Get localized title and description
  const title = t(`${slug}_title` as any);
  const description = t(`${slug}_description` as any);

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>

        <ToolGrid tools={filteredTools} />
      </div>
    </div>
  );
}
