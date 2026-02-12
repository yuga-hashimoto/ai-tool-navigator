import { getAllPosts } from "@/lib/posts";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Blog - AI Tool Navigator",
  description: "Latest news, reviews, and insights about AI tools and technology.",
};

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations("BlogPage");
  const tBreadcrumbs = await getTranslations('Breadcrumbs');
  const posts = getAllPosts(locale);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('blog') },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);

  return (
    <div className="bg-white dark:bg-black min-h-screen py-24 sm:py-32 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("description")}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post, index) => (
            <ArticleCard key={post.slug} post={post} locale={locale} priority={index < 3} />
          ))}
        </div>
      </div>
    </div>
  );
}
