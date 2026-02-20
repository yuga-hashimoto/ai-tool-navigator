import { Package } from 'lucide-react';
import { Order, OrderItem, Product } from '@prisma/client';

interface OrderCardProps {
  order: Order & { items: (OrderItem & { product: Product })[] };
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            order.status === 'PAID' ? 'bg-green-100 text-green-800' :
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
          <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
