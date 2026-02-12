import { Rating } from "@/components/Rating";

interface RatingBreakdownProps {
  breakdown: Record<string, number>;
  title: string;
}

export function RatingBreakdown({ breakdown, title }: RatingBreakdownProps) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  // Helper to format keys like "ease_of_use" -> "Ease of Use"
  const formatKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="mt-8 rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-900/5 dark:bg-white/5 dark:ring-white/10">
      <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
        {title}
      </h2>
      <div className="space-y-4">
        {Object.entries(breakdown).map(([key, rating]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {formatKey(key)}
            </span>
            <div className="flex items-center gap-3">
              <Rating rating={rating} showText={false} size="h-4 w-4" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 min-w-[2rem] text-right">
                {rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
