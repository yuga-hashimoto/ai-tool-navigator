'use client';

import { useEffect, useState } from 'react';
import { Heading } from '@/lib/markdown';
import { twMerge } from 'tailwind-merge';

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-2 font-sans text-sm">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider text-xs">
        Table of Contents
      </h3>
      <ul className="space-y-2 border-l border-zinc-200 dark:border-zinc-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={twMerge(
                'block py-1 -ml-px border-l-2 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100',
                heading.level === 3 ? 'pl-8' : 'pl-4',
                heading.level > 3 ? 'pl-10' : '',
                activeId === heading.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-medium'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
