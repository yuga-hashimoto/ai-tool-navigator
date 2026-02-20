import { getUserOrders } from '@/actions/account';
import OrderCard from '@/components/account/OrderCard';

export default async function OrdersPage() {
  const { orders } = await getUserOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
        </div>
      )}
    </div>
  );
}
