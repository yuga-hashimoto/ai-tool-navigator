import { Link } from '@/i18n/routing';
import { MOCK_USER, MOCK_ORDERS } from '@/lib/mock-data';

export const metadata = {
  title: 'Dashboard - Account',
  description: 'Account overview and recent activity',
};

export default function AccountDashboardPage() {
  const recentOrders = MOCK_ORDERS.slice(0, 3);

  return (
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome back, {MOCK_USER.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {MOCK_USER.email}<br />
            {MOCK_USER.address.city}, {MOCK_USER.address.country}
          </p>
          <Link href="/account/profile" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
            Edit Profile &rarr;
          </Link>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Subscription</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Manage your subscription plan and billing details.
          </p>
          <Link href="/account/subscription" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
            View Subscription &rarr;
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-zinc-700 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href="/account/orders" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
            View all
          </Link>
        </div>

        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200 dark:divide-zinc-700">
            {recentOrders.map((order) => (
              <li key={order.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <Link href={`/account/orders/${order.id}`} className="hover:underline focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Order #{order.id}
                    </Link>
                  </h3>
                  <div className="mt-1 flex justify-between items-center">
                     <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {order.items.map(item => item.name).join(', ')}
                     </p>
                     <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                     </p>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {order.status}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
