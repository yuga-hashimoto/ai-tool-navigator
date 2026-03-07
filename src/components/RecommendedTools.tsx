import { getRecommendations } from '@/lib/recommendations';
import { cookies } from 'next/headers';
import { getSessionCookieName } from '@/lib/affiliate-tracking';
import { ToolCard } from '@/components/ToolCard';
import { getTranslations } from 'next-intl/server';
import { filterToolList } from '@/lib/editorial';

interface RecommendedToolsProps {
  currentSlug: string;
  locale: string;
  limit?: number;
}

export async function RecommendedTools({ currentSlug, locale, limit = 3 }: RecommendedToolsProps) {
  const cookieStore = await cookies();
  const sessionCookieName = getSessionCookieName();
  const sessionId = cookieStore.get(sessionCookieName)?.value || 'anonymous';

  const recommendations = await getRecommendations(sessionId, currentSlug, limit, locale);
  const visibleRecommendations = filterToolList(recommendations);

  if (visibleRecommendations.length === 0) {
    return null;
  }

  const t = await getTranslations('ToolPage');

  return (
    <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            {t('recommendedTools')}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRecommendations.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
            ))}
        </div>
    </div>
  );
}
