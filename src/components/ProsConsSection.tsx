
import { CheckCircle2, XCircle } from "lucide-react";

interface ProsConsSectionProps {
  pros?: string[];
  cons?: string[];
  labels: {
    pros: string;
    cons: string;
    title?: string;
  };
}

export function ProsConsSection({ pros, cons, labels }: ProsConsSectionProps) {
  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return null;
  }

  return (
    <div className="mt-8">
      {labels.title && (
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            {labels.title}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {pros && pros.length > 0 && (
          <div className="rounded-2xl bg-green-50/50 p-6 ring-1 ring-green-600/10 dark:bg-green-500/5 dark:ring-green-500/20">
            <h3 className="flex items-center text-sm font-semibold text-green-700 dark:text-green-400 mb-4">
              <CheckCircle2 className="mr-2 h-5 w-5" /> {labels.pros}
            </h3>
            <ul className="space-y-3">
              {pros.map((pro, idx) => (
                <li key={idx} className="flex items-start text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mr-2">•</span> {pro}
                </li>
              ))}
            </ul>
          </div>
        )}
        {cons && cons.length > 0 && (
          <div className="rounded-2xl bg-red-50/50 p-6 ring-1 ring-red-600/10 dark:bg-red-500/5 dark:ring-red-500/20">
            <h3 className="flex items-center text-sm font-semibold text-red-700 dark:text-red-400 mb-4">
              <XCircle className="mr-2 h-5 w-5" /> {labels.cons}
            </h3>
            <ul className="space-y-3">
              {cons.map((con, idx) => (
                <li key={idx} className="flex items-start text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mr-2">•</span> {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
