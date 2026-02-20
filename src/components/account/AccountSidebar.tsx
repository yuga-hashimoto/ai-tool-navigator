'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Gift, Settings, CreditCard } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/account/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { name: 'Loyalty & Rewards', href: '/account/loyalty', icon: Gift },
  { name: 'Subscription', href: '/account/subscription', icon: CreditCard },
  { name: 'Preferences', href: '/account/preferences', icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
              ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
