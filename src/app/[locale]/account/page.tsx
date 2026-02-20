import { getDashboardStats } from '@/actions/account';
import { Link } from '@/i18n/routing';
import {
  ShoppingBag,
  Award,
  CreditCard,
  ArrowRight
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard - My Account',
};

export default async function AccountDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {stats.name}</h1>
          <p className="text-gray-600">{stats.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.ordersCount}</div>
          <p className="text-sm text-gray-500 mt-1">
             Lifetime spent: ${stats.totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Loyalty Points</h3>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.points}</div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.tier} Member
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Current Plan</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.plan === 'PRO' ? 'Pro Plan' : 'Free Plan'}
          </div>
          <div className="mt-2">
            <Link href="/account/subscription" className="text-sm text-blue-600 hover:underline inline-block">
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-md">
          <h3 className="text-lg font-bold mb-2">Explore Loyalty Rewards</h3>
          <p className="text-blue-100 mb-6">You have points to redeem! Check out our exclusive rewards catalog.</p>
          <Link
            href="/account/loyalty"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            View Rewards <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to show.</p>
            <div className="mt-4">
              <Link href="/account/orders" className="text-blue-600 hover:underline text-sm inline-block">
                View Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
