import { Link } from '@/i18n/routing';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                 <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-400 mx-2" aria-hidden="true" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                      index === 0
                      ? "text-zinc-400 hover:text-zinc-500"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {index === 0 ? <Home className="h-4 w-4" /> : item.label}
                  {index === 0 && <span className="sr-only">{item.label}</span>}
                </Link>
              ) : (
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100" aria-current="page">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
