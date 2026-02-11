import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  rating: number;
  className?: string;
  showText?: boolean;
  size?: string;
  compact?: boolean;
  textClassName?: string;
}

export function Rating({ rating, className, showText = true, size = "h-4 w-4", compact = false, textClassName }: RatingProps) {
  // If rating > 5, assume it's out of 10.
  const is10PointScale = rating > 5;
  const maxScale = is10PointScale ? 10 : 5;
  // Normalize to 5 stars.
  const normalizedRating = is10PointScale ? rating / 2 : rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {compact ? (
          <div className="flex items-center gap-1">
             <Star className={cn(size, "fill-yellow-400 text-yellow-400")} />
             {showText && (
                <span className={cn("text-sm font-semibold text-zinc-900 dark:text-zinc-100", textClassName)}>
                  {rating}
                   <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-0.5">/ {maxScale}</span>
                </span>
             )}
          </div>
      ) : (
          <>
            <div className="flex relative gap-0.5">
                {[...Array(5)].map((_, i) => {
                    // Calculate fill percentage for this star
                    const fillPercentage = Math.max(0, Math.min(1, normalizedRating - i)) * 100;

                    return (
                        <div key={i} className="relative">
                            {/* Background star (empty) */}
                            <Star className={cn(size, "text-zinc-200 dark:text-zinc-700 fill-zinc-200 dark:fill-zinc-700")} />

                            {/* Foreground star (filled) */}
                            <div className="absolute top-0 left-0 overflow-hidden h-full" style={{ width: `${fillPercentage}%` }}>
                                 <Star className={cn(size, "text-yellow-400 fill-yellow-400")} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {showText && (
                <span className={cn("text-sm font-semibold text-zinc-900 dark:text-zinc-100 ml-1", textClassName)}>
                {rating}
                <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-0.5">/ {maxScale}</span>
                </span>
            )}
          </>
      )}
    </div>
  );
}
