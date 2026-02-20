'use client';

import { useEffect, useState } from 'react';
import { Package, Clock } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1 gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-gray-900">${order.total}</p>
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-4 mt-4">
                    <div className="space-y-3">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded">
                                        <Package className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium">${item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
