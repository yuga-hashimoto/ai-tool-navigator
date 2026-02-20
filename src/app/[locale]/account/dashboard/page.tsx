import { getUserDashboard } from '@/actions/account';
import OrderCard from '@/components/account/OrderCard';
import LoyaltyCard from '@/components/account/LoyaltyCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const { user, recentOrders } = await getUserDashboard();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {user.loyalty && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Loyalty Status</h2>
            <LoyaltyCard loyalty={user.loyalty} />
            <div className="text-right">
              <Link href="/account/loyalty" className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                View Rewards <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No recent orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
