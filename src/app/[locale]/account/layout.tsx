import { Link } from '@/i18n/routing';
import { ReactNode } from 'react';

// Mock navigation items
const navItems = [
  { name: 'Dashboard', href: '/account' },
  { name: 'Orders', href: '/account/orders' },
  { name: 'Profile', href: '/account/profile' },
  { name: 'Subscription', href: '/account/subscription' },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Account</h2>
        </div>
        <nav className="px-4 pb-6">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
