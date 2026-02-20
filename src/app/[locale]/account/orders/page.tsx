import { Link } from '@/i18n/routing';
import { MOCK_ORDERS } from '@/lib/mock-data';

export const metadata = {
  title: 'Order History - Account',
  description: 'View your past orders',
};

export default function OrderHistoryPage() {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order History</h1>

      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200 dark:divide-zinc-700">
          {MOCK_ORDERS.map((order) => (
            <li key={order.id} className="py-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      <Link href={`/account/orders/${order.id}`} className="hover:underline">
                        Order #{order.id}
                      </Link>
                   </h3>
                   <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="truncate">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span className="mx-2">&middot;</span>
                      <span className="truncate">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </span>
                   </div>
                   <div className="mt-2 text-sm text-gray-900 dark:text-gray-300">
                      Total: ${order.total.toFixed(2)}
                   </div>
                </div>
                <div>
                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {order.status}
                    </span>
                    <div className="mt-2 text-right">
                       <Link href={`/account/orders/${order.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                          View Details &rarr;
                       </Link>
                    </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
