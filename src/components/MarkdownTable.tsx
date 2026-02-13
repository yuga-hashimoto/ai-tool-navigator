import React from 'react';

export const MarkdownTable = (props: React.TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="overflow-x-auto my-8">
      <table {...props} className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800" />
    </div>
  );
};
