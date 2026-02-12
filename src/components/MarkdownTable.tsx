import React from 'react';

export function MarkdownTable({ node, ...props }: any) {
  return (
    <div className="overflow-x-auto my-6 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <table {...props} className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800" />
    </div>
  );
}
