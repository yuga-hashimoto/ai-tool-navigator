import Link from 'next/link';
import { Star } from 'lucide-react';
import { ToolMetadata } from '@/lib/tools';
import { cn } from '@/lib/utils';

export function ToolCard({ tool }: { tool: ToolMetadata }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
      <div>
        <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
              {tool.category}
            </span>
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.rating}</span>
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-lg font-semibold leading-6 text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                <Link href={`/tools/${tool.slug}`}>
                    <span className="absolute inset-0" />
                    {tool.title}
                </Link>
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {tool.description}
            </p>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
        Read more <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}
