import { Link } from '@/i18n/routing';

const orders = [
  { id: 'ORD-12345', date: '2023-10-25', status: 'PAID', total: 129.99, items: 3 },
  { id: 'ORD-12346', date: '2023-11-02', status: 'PENDING', total: 59.50, items: 1 },
  { id: 'ORD-12347', date: '2023-11-15', status: 'CANCELLED', total: 299.00, items: 2 },
  { id: 'ORD-12348', date: '2023-11-20', status: 'PAID', total: 45.00, items: 1 },
];

export default function AccountOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
      </div>

      <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.id}`} className="block hover:bg-gray-50 dark:hover:bg-zinc-700 transition duration-150 ease-in-out">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">{order.id}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                        ${order.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {order.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {order.items} {order.items === 1 ? 'item' : 'items'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                        Total: <span className="font-medium text-gray-900 dark:text-white ml-1">${order.total.toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                      <p>
                        Placed on <time dateTime={order.date}>{order.date}</time>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
