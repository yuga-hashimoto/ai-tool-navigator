import { getContentBasedRecommendations } from '@/lib/recommendations';
import { getToolBySlug, getAllTools } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { getTranslations } from 'next-intl/server';

interface RecommendedToolsProps {
  currentSlug: string;
  locale: string;
  limit?: number;
}

export async function RecommendedTools({ currentSlug, locale, limit = 3 }: RecommendedToolsProps) {
  const currentTool = await getToolBySlug(currentSlug, locale);

  if (!currentTool) {
    return null;
  }

  const allTools = await getAllTools(locale);
  const recommendations = getContentBasedRecommendations(currentTool.metadata, allTools, limit);

  if (recommendations.length === 0) {
    return null;
  }

  const t = await getTranslations('ToolPage');

  return (
    <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            {t('recommendedTools')}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
            ))}
        </div>
    </div>
  );
}
