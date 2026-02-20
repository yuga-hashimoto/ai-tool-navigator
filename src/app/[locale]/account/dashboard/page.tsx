'use client';

import { useEffect, useState } from 'react';
import { User, ShoppingBag, Award, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AccountDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, loyaltyRes, ordersRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/loyalty/dashboard'),
          fetch('/api/orders')
        ]);

        const userData = await userRes.json();
        const loyaltyData = await loyaltyRes.json();
        const ordersData = await ordersRes.json();

        setUser({
          ...userData.user,
          loyalty: loyaltyData.user,
          orders: ordersData.orders
        });
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!user) return <div>Failed to load data</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/account/orders" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            <p className="text-gray-500 text-sm mt-1">{user.orders?.length || 0} recent orders</p>
          </div>
        </Link>

        <Link href="/account/loyalty" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Loyalty Points</h3>
            <p className="text-gray-500 text-sm mt-1">{user.loyalty?.currentPoints || 0} points available</p>
          </div>
        </Link>

        <Link href="/account/subscription" className="block">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
            <p className="text-gray-500 text-sm mt-1">Manage plan & billing</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
        </div>

        <div className="space-y-4">
            {user.orders?.slice(0, 3).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-gray-900">${order.total}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                </div>
            ))}
            {(!user.orders || user.orders.length === 0) && (
                <p className="text-gray-500 text-center py-4">No orders found.</p>
            )}
        </div>
      </div>
    </div>
  );
}
