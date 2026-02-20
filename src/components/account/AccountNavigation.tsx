'use client';

import { Link, usePathname } from '@/i18n/routing';

export default function AccountNavigation() {
  const pathname = usePathname();

  const links = [
    { href: '/account', label: 'Dashboard' },
    { href: '/account/orders', label: 'Order History' },
    { href: '/account/profile', label: 'Profile Settings' },
    { href: '/account/subscription', label: 'Subscription' },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        // usePathname returns path without locale, e.g. "/account" or "/account/orders"
        // For dashboard, we want exact match. For others, startsWith might be better to handle sub-pages (like order details)
        // But for this simple list, exact match for dashboard and startsWith for others (except dashboard) is a good heuristic.

        let isActive = false;
        if (link.href === '/account') {
            isActive = pathname === '/account';
        } else {
            isActive = pathname.startsWith(link.href);
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
