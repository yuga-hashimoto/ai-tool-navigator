import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { routing } from "@/i18n/routing";
import { Calendar, User } from "lucide-react";
import { Metadata } from "next";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    const posts = getAllPosts(locale);
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
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.metadata.title} - AI Tool Navigator Blog`,
    description: post.metadata.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug, locale);
  const tBreadcrumbs = await getTranslations('Breadcrumbs');

  if (!post) {
    notFound();
  }

  const { metadata, content } = post;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('blog'), href: '/blog' },
    { label: metadata.title },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <ReadingProgressBar />
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <article>
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={metadata.date}>
                            {new Date(metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                    </div>
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
            </header>
            
            <div className="prose prose-lg prose-zinc dark:prose-invert mx-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        </article>
      </div>
    </div>
  );
}
