'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Award,
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react';

export function AccountSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/account/dashboard', label: 'Dashboard', icon: User },
    { href: '/account/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/account/loyalty', label: 'Loyalty & Rewards', icon: Award },
    { href: '/account/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/account/preferences', label: 'Settings', icon: Settings },
  ];

  // Helper to check if link is active, handling potential locale prefix
  const isActive = (href: string) => {
    return pathname?.endsWith(href);
  };

  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border border-gray-100 h-fit">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">My Account</h2>
        <p className="text-sm text-gray-500">Manage your profile</p>
      </div>

      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <button
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          onClick={() => {
            // Handle sign out
            window.location.href = '/';
          }}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
