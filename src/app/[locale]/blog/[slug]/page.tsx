import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkRelatedPost } from "@/lib/remark-related-post";
import { remarkComparisonTable } from "@/lib/remark-comparison-table";
import { remarkYoutube } from "@/lib/remark-youtube";
import rehypeSlug from "rehype-slug";
import { routing, Link } from "@/i18n/routing";
import { Calendar, User, Clock } from "lucide-react";
import { Metadata } from "next";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { extractHeadings } from "@/lib/markdown";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { RelatedPost } from "@/components/RelatedPost";
import { ComparisonTable } from "@/components/ComparisonTable";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { generateBlogPostSchema, generateBreadcrumbSchema } from "@/lib/schema";
import { getToolOfTheWeek, getAllTools, ToolMetadata } from "@/lib/tools";
import { ToolOfTheWeekSidebar } from "@/components/ToolOfTheWeekSidebar";
import { HeaderLinkButton } from "@/components/HeaderLinkButton";
import { rehypeAdInjection } from "@/lib/rehype-ad-injection";
import { DynamicAdUnit } from "@/components/DynamicAdUnit";

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    const posts = await getAllPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string, locale: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const title = `${post.metadata.title} - AI Tool Navigator Blog`;
  const description = post.metadata.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.metadata.date,
      authors: [post.metadata.author],
      url: `/${locale}/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  const post = await getPostBySlug(slug, locale);
  const tBreadcrumbs = await getTranslations('Breadcrumbs');
  const tBlog = await getTranslations('BlogPage');
  const tShare = await getTranslations('ShareButtons');

  if (!post) {
    notFound();
  }

  const { metadata, content } = post;
  const headings = extractHeadings(content);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${slug}`;
  const schema = generateBlogPostSchema(post, url);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('blog'), href: '/blog' },
    { label: metadata.title },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, locale);

  // Fetch recent posts
  const allPosts = await getAllPosts(locale);
  const recentPosts = allPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 5);

  const toolOfTheWeek = await getToolOfTheWeek(locale);
  const allTools = await getAllTools(locale);

  const dateLocale = locale === 'ja' ? 'ja-JP' : 'en-US';

  const components = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h1: ({node: _node, children, id, ...props}: any) => (
      <h1 id={id} className="scroll-mt-24 group relative flex items-center" {...props}>
        <span>{children}</span>
        {id && <HeaderLinkButton id={id} />}
      </h1>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h2: ({node: _node, children, id, ...props}: any) => (
      <h2 id={id} className="scroll-mt-24 group relative flex items-center" {...props}>
        <span>{children}</span>
        {id && <HeaderLinkButton id={id} />}
      </h2>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h3: ({node: _node, children, id, ...props}: any) => (
      <h3 id={id} className="scroll-mt-24 group relative flex items-center" {...props}>
        <span>{children}</span>
        {id && <HeaderLinkButton id={id} />}
      </h3>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h4: ({node: _node, children, id, ...props}: any) => (
      <h4 id={id} className="scroll-mt-24 group relative flex items-center" {...props}>
        <span>{children}</span>
        {id && <HeaderLinkButton id={id} />}
      </h4>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'related-post': (props: any) => {
      const { slug } = props;
      const post = allPosts.find((p) => p.slug === slug);
      if (!post) return null;
      return <RelatedPost post={post} />;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'comparison-table': (props: any) => {
      const { tools } = props;
      if (!tools) return null;
      const slugs = (tools as string).split(',').map(s => s.trim());
      const toolsData = slugs
        .map(slug => allTools.find((t) => t.slug === slug))
        .filter((t): t is ToolMetadata => t !== undefined);

      if (toolsData.length === 0) return null;

      return <ComparisonTable tools={toolsData} />;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'youtube-embed': (props: any) => {
        return <YouTubeEmbed {...props} />;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'ad-slot': ({ index }: { index: number | string }) => (
      <DynamicAdUnit
        index={Number(index) - 1}
        type="content"
        slot="content"
        className="my-8"
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ReadingProgressBar />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <main className="lg:col-span-8">
                <article>
                    <header className="mb-10 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-wrap">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={metadata.date}>
                                    {new Date(metadata.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                            </div>
                            {metadata.readingTime > 0 && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{tBlog('readingTime', { minutes: metadata.readingTime })}</span>
                                    </div>
                                </>
                            )}
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{metadata.author}</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl mb-6">
                            {metadata.title}
                        </h1>
                        {metadata.tags && metadata.tags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {metadata.tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-center mt-6">
                            <ShareButtons
                                url={url}
                                title={metadata.title}
                                twitterText={tShare('twitterSharePost', { postTitle: metadata.title })}
                            />
                        </div>
                    </header>

                    <div className="prose prose-lg prose-zinc dark:prose-invert">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkDirective, remarkRelatedPost, remarkComparisonTable, remarkYoutube]}
                            rehypePlugins={[rehypeSlug, rehypeAdInjection]}
                            components={components}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </article>
            </main>

            <aside className="lg:col-span-4 space-y-8">
                 <div className="sticky top-24 space-y-8">
                    <div className="hidden lg:block space-y-8">
                        <TableOfContents headings={headings} />
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-xs">
                                {tShare('shareThisPost')}
                            </h3>
                            <ShareButtons
                                url={url}
                                title={metadata.title}
                                twitterText={tShare('twitterSharePost', { postTitle: metadata.title })}
                            />
                        </div>
                    </div>

                    <DynamicAdUnit index={0} type="sidebar" slot="sidebar" />

                    <ToolOfTheWeekSidebar tool={toolOfTheWeek} />

                    <div>
                         <h3 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">
                            {tBlog('recentPosts')}
                         </h3>
                         <ul className="space-y-6">
                            {recentPosts.map((post, index) => (
                                <li key={post.slug} className="group">
                                    <Link href={`/blog/${post.slug}`} className="flex gap-4">
                                         {post.image && (
                                             <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                <Image
                                                    src={post.image}
                                                    alt={post.title}
                                                    fill
                                                    priority={index < 2}
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                             </div>
                                         )}
                                         <div className="flex flex-col justify-center">
                                             <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                {post.title}
                                             </h4>
                                             <time className="text-xs text-zinc-500 mt-1 block">
                                                {new Date(post.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                                             </time>
                                         </div>
                                    </Link>
                                </li>
                            ))}
                         </ul>
                    </div>
                 </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
