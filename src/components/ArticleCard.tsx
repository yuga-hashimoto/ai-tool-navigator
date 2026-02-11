import { PostMetadata } from "@/lib/posts";
import { Link } from "@/i18n/routing";
import Image from "next/image";

interface ArticleCardProps {
  post: PostMetadata;
  locale: string;
}

export function ArticleCard({ post, locale }: ArticleCardProps) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const dateLocale = locale === 'ja' ? 'ja-JP' : 'en-US';

  return (
    <article className="flex flex-col items-start justify-between">
      {post.image && (
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <div className="relative w-full">
         <div className="flex items-center gap-x-4 text-xs">
          <time dateTime={post.date} className="text-zinc-500 dark:text-zinc-400">
            {new Date(post.date).toLocaleDateString(dateLocale, dateOptions)}
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
  );
}
