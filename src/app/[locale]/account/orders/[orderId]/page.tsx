import { Link } from '@/i18n/routing';

// Mock data
const orders = [
  {
    id: 'ORD-12345',
    date: '2023-10-25',
    status: 'PAID',
    total: 129.99,
    items: [
      { id: '1', name: 'AI Writing Assistant Pro', quantity: 1, price: 99.99 },
      { id: '2', name: 'SEO Toolkit Basic', quantity: 2, price: 15.00 },
    ],
  },
  {
    id: 'ORD-12346',
    date: '2023-11-02',
    status: 'PENDING',
    total: 59.50,
    items: [
      { id: '3', name: 'Image Generator Credits', quantity: 1, price: 59.50 },
    ],
  },
  {
    id: 'ORD-12347',
    date: '2023-11-15',
    status: 'CANCELLED',
    total: 299.00,
    items: [
      { id: '4', name: 'Enterprise Analytics Suite', quantity: 1, price: 299.00 },
    ],
  },
    {
    id: 'ORD-12348',
    date: '2023-11-20',
    status: 'PAID',
    total: 45.00,
    items: [
      { id: '5', name: 'Social Media Scheduler', quantity: 1, price: 45.00 },
    ],
  },
];

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
        <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">The order you are looking for does not exist.</p>
            <Link href="/account/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                Back to Orders
            </Link>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order {order.id}</h1>
        <Link href="/account/orders" className="text-sm text-blue-600 hover:text-blue-500">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Order Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Placed on {order.date} &bull; Status: <span className="font-medium">{order.status}</span>
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
            {order.items.map((item) => (
              <li key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">${item.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-zinc-900 px-4 py-4 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
            <p>Total</p>
            <p>${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
