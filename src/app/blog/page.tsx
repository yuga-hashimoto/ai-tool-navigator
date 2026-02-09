import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - AI Tool Navigator",
  description: "Latest news, reviews, and insights about AI tools and technology.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-white dark:bg-black min-h-screen py-24 sm:py-32 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            AI Insights & Reviews
          </h1>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Deep dives into the latest AI tools, comparisons, and industry trends.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col items-start justify-between">
              <div className="relative w-full">
                {/* Image placeholder could go here */}
                 <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.date} className="text-zinc-500 dark:text-zinc-400">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  {post.tags && post.tags.length > 0 && (
                      <span className="relative z-10 rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                        {post.tags[0]}
                      </span>
                  )}
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {post.excerpt}
                  </p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      <span className="absolute inset-0" />
                      {post.author}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
