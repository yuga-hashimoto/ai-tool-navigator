import React from 'react';

export function GoogleAdsensePlaceholder() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-gray-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
      <div className="flex h-[250px] w-full max-w-[300px] items-center justify-center rounded border border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
          Google AdSense
        </span>
      </div>
      <span className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        Advertisement
      </span>
    </div>
  );
}
