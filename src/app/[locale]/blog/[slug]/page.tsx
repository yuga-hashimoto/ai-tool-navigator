import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { routing } from "@/i18n/routing";
import { Calendar, User } from "lucide-react";
import { Metadata } from "next";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import { extractHeadings } from "@/lib/markdown";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";

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

  const title = `${post.metadata.title} - AI Tool Navigator Blog`;
  const description = post.metadata.excerpt;

  return {
    title,
    description,
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
  const post = getPostBySlug(slug, locale);
  const tBreadcrumbs = await getTranslations('Breadcrumbs');
  const tShare = await getTranslations('ShareButtons');

  if (!post) {
    notFound();
  }

  const { metadata, content } = post;
  const headings = extractHeadings(content);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${slug}`;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('blog'), href: '/blog' },
    { label: metadata.title },
  ];

  const components = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h1: ({node: _node, ...props}: any) => <h1 className="scroll-mt-24" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h2: ({node: _node, ...props}: any) => <h2 className="scroll-mt-24" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h3: ({node: _node, ...props}: any) => <h3 className="scroll-mt-24" {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    h4: ({node: _node, ...props}: any) => <h4 className="scroll-mt-24" {...props} />,
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <main className="lg:col-span-8">
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
                        <div className="flex justify-center mt-6">
                            <ShareButtons url={url} title={metadata.title} />
                        </div>
                    </header>

                    <div className="prose prose-lg prose-zinc dark:prose-invert">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSlug]}
                            components={components}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </article>
            </main>
            <aside className="hidden lg:block lg:col-span-4">
                 <div className="sticky top-24 space-y-8">
                    <TableOfContents headings={headings} />
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-xs">
                            {tShare('shareThisPost')}
                        </h3>
                        <ShareButtons url={url} title={metadata.title} />
                    </div>
                 </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
