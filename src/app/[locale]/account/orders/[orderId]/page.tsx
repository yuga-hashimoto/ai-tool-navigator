import { Link } from '@/i18n/routing';
import { MOCK_ORDERS } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Order Details - Account',
  description: 'View order details',
};

export default async function OrderDetailsPage({
  params
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params;
  const order = MOCK_ORDERS.find((o) => o.id === orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-6">
        <Link href="/account/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
             Order #{order.id}
           </h1>
           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
             Placed on {new Date(order.date).toLocaleDateString()}
           </p>
        </div>
        <div className="mt-4 md:mt-0">
           <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              order.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {order.status}
           </span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-zinc-700 py-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Items</h2>
        <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
          {order.items.map((item) => (
            <li key={item.id} className="py-4 flex justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                ${item.price.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 dark:border-zinc-700 pt-8">
        <div className="flex justify-end">
          <div className="w-full md:w-1/3">
             <div className="flex justify-between py-2">
               <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
               <span className="font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
             </div>
             <div className="flex justify-between py-2">
               <span className="text-gray-600 dark:text-gray-400">Tax</span>
               <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
             </div>
             <div className="flex justify-between py-2 border-t border-gray-200 dark:border-zinc-700 mt-2">
               <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
               <span className="text-lg font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
