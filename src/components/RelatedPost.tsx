import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { PostMetadata } from '@/lib/posts';

export function RelatedPost({ post }: { post: PostMetadata }) {
  return (
    <div className="my-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <Link href={`/blog/${post.slug}`} className="flex items-center gap-4 group">
         {post.image && (
             <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
             </div>
         )}
         <div className="flex flex-col justify-center">
             <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                Related Post
             </span>
             <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
             </h4>
         </div>
      </Link>
    </div>
  );
}
