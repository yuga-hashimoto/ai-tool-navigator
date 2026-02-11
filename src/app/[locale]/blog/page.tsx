import { getAllPosts } from "@/lib/posts";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/ArticleCard";

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
  const posts = getAllPosts(locale);

  return (
    <div className="bg-white dark:bg-black min-h-screen py-24 sm:py-32 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("description")}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
