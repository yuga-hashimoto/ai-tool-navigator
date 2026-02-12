import { Rating } from "@/components/Rating";

interface RatingBreakdownProps {
  breakdown: Record<string, number>;
  title: string;
}

export function RatingBreakdown({ breakdown, title }: RatingBreakdownProps) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  const formatKey = (key: string) => {
    return key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
        {title}
      </h2>
      <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-900/5 dark:bg-white/5 dark:ring-white/10">
        <div className="grid grid-cols-1 gap-y-4 gap-x-12 sm:grid-cols-2">
          {Object.entries(breakdown).map(([key, rating]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {formatKey(key)}
              </span>
              <Rating
                rating={rating}
                size="h-4 w-4"
                showText={true}
                compact={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
