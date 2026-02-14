import { getToolBySlug, getToolSlugs, getRelatedTools } from "@/lib/tools";
import { getRelatedPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkYoutube } from "@/lib/remark-youtube";
import { ExternalLink, BadgeCheck, Calendar } from "lucide-react";
import { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { Rating } from "@/components/Rating";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import { generateProductSchema, generateToolSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { ProsConsSection } from "@/components/ProsConsSection";
import { RatingBreakdown } from "@/components/RatingBreakdown";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getCategorySlug } from "@/lib/breadcrumbs";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ShareButtons } from "@/components/ShareButtons";
import { AffiliateLinkButton } from "@/components/AffiliateLinkButton";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { ActivityTracker } from "@/components/ActivityTracker";

export async function generateStaticParams() {
  const slugs = getToolSlugs();
  return slugs;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const tool = await getToolBySlug(slug, locale);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }

  const title = `${tool.metadata.title} - AI Tool Navigator`;
  const description = tool.metadata.description;

  return {
    title,
    description,
    alternates: {
        canonical: `/${locale}/tools/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/${locale}/tools/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const tool = await getToolBySlug(slug, locale);
  const t = await getTranslations('ToolPage');
  const tBreadcrumbs = await getTranslations('Breadcrumbs');
  const tShare = await getTranslations('ShareButtons');

  if (!tool) {
    notFound();
  }

  const { metadata, content } = tool;
  const { verified, last_updated } = metadata;
  const relatedTools = await getRelatedTools(metadata, 3, locale);
  const relatedPosts = await getRelatedPosts(metadata, 3, locale);
  const toolSchema = generateToolSchema(tool);
  const productSchema = generateProductSchema(tool);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/tools/${slug}`;

  const categorySlug = getCategorySlug(metadata.category);
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
  ];

  if (categorySlug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    breadcrumbItems.push({ label: tBreadcrumbs(categorySlug as any), href: `/category/${categorySlug}` });
  }

  breadcrumbItems.push({ label: metadata.title });

  const components = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'youtube-embed': (props: any) => {
        return <YouTubeEmbed {...props} />;
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, locale);

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <ActivityTracker type="VIEW" details={{ slug, toolName: metadata.title }} />

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-900/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="px-6 py-8 sm:px-12 sm:py-12 lg:px-16">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-x-3 flex-wrap">
                             <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                                    {metadata.title}
                                </h1>
                                {verified && (
                                    <BadgeCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" aria-label="Verified Tool" />
                                )}
                             </div>
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                                {metadata.category}
                            </span>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <Rating rating={metadata.rating || 0} size="h-5 w-5" textClassName="text-lg font-semibold text-zinc-900 dark:text-zinc-100" />
                            {last_updated && (
                                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>{t('lastUpdated')}: {new Date(last_updated).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <CopyLinkButton className="w-full sm:w-auto" />
                        <AffiliateLinkButton
                            href={metadata.affiliate_link}
                            toolSlug={metadata.slug}
                            toolName={metadata.title}
                            position="hero_section"
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-green-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all transform hover:scale-105"
                        >
                            {t('tryThisTool')} <ExternalLink className="ml-2 h-4 w-4" />
                        </AffiliateLinkButton>
                    </div>
                </div>

                <ProsConsSection
                    pros={metadata.pros}
                    cons={metadata.cons}
                    labels={{
                        title: t('prosConsTitle'),
                        pros: t('pros'),
                        cons: t('cons'),
                    }}
                />

                {metadata.rating_breakdown && (
                    <RatingBreakdown
                        breakdown={metadata.rating_breakdown}
                        title={t('ratingBreakdown')}
                    />
                )}

                <div className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkDirective, remarkYoutube]}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        components={components as any}
                    >
                        {content}
                    </ReactMarkdown>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        {tShare('shareThisTool')}
                    </h3>
                    <ShareButtons
                        url={url}
                        title={metadata.title}
                        twitterText={tShare('twitterShareTool', { toolName: metadata.title })}
                    />
                </div>
            </div>
        </div>

        {relatedTools.length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                    {t('relatedTools')}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedTools.map((relatedTool) => (
                        <ToolCard key={relatedTool.slug} tool={relatedTool} />
                    ))}
                </div>
            </div>
        )}

        {relatedPosts.length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                    {t('relatedArticles')}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.map((post) => (
                        <ArticleCard key={post.slug} post={post} locale={locale} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
