import { Link } from '@/i18n/routing';

const recentOrders = [
  { id: 'ORD-12345', date: '2023-10-25', status: 'PAID', total: 129.99 },
  { id: 'ORD-12346', date: '2023-11-02', status: 'PENDING', total: 59.50 },
  { id: 'ORD-12347', date: '2023-11-15', status: 'CANCELLED', total: 299.00 },
];

export default function AccountDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, User!</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your account, view orders, and more.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
                <Link href="/account/profile" className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-zinc-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600">
                    Edit Profile
                </Link>
                <Link href="/account/orders" className="block w-full text-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    View All Orders
                </Link>
            </div>
        </div>

        {/* Recent Orders Summary */}
        <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h2>
             <Link href="/account/orders" className="text-sm text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
            {recentOrders.map((order) => (
              <li key={order.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{order.id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${order.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {order.status.toLowerCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
