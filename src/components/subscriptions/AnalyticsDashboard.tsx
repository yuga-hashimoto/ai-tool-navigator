// Subscription Analytics Dashboard
// Admin dashboard for monitoring subscription metrics

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface AnalyticsData {
  date: string;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  activeTrials: number;
  totalUsers: number;
  newSubscriptions: number;
  cancellations: number;
  churnRate: number;
  arpu: number;
}

interface MRRHistory {
  date: string;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
}

interface RevenueByTier {
  [tierName: string]: {
    count: number;
    revenue: number;
  };
}

interface AnalyticsDashboardProps {
  adminApiKey?: string;
}

export default function AnalyticsDashboard({ adminApiKey }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [history, setHistory] = useState<MRRHistory[]>([]);
  const [revenueByTier, setRevenueByTier] = useState<RevenueByTier>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch current analytics
      const analyticsRes = await fetch('/api/subscriptions/analytics?type=current');
      const analyticsData = await analyticsRes.json();
      
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      // Fetch history
      const historyRes = await fetch('/api/subscriptions/analytics?type=history&days=30');
      const historyData = await historyRes.json();
      
      if (historyData.success) {
        setHistory(historyData.data);
      }

      // Fetch revenue by tier
      const tierRes = await fetch('/api/subscriptions/analytics?type=byTier');
      const tierData = await tierRes.json();
      
      if (tierData.success) {
        setRevenueByTier(tierData.data);
      }
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No analytics data available yet.</p>
      </div>
    );
  }

  // Calculate trends from history
  const previousMRR = history.length > 1 ? history[history.length - 2]?.mrr || 0 : analytics.mrr;
  const mrrChange = previousMRR > 0 
    ? ((analytics.mrr - previousMRR) / previousMRR) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Analytics</h1>
          <p className="text-gray-600">Track your recurring revenue performance</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className={`inline-flex items-center text-sm font-medium ${
              mrrChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {mrrChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {formatPercent(Math.abs(mrrChange))}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.mrr)}</p>
        </div>

        {/* ARR */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Annual Recurring Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.arr)}</p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.activeSubscriptions}</p>
          <p className="text-xs text-gray-500 mt-1">
            +{analytics.activeTrials} in trial
          </p>
        </div>

        {/* ARPU */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg. Revenue Per User</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.arpu)}</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Churn Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Churn Rate</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className={`text-2xl font-bold ${analytics.churnRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
            {formatPercent(analytics.churnRate)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.churnRate > 5 ? 'High' : analytics.churnRate > 2 ? 'Moderate' : 'Healthy'} churn rate
          </p>
        </div>

        {/* New Subscriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">New This Month</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.newSubscriptions}</p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.totalUsers > 0 
              ? `${formatPercent((analytics.newSubscriptions / analytics.totalUsers) * 100)} growth` 
              : 'First subscribers'}
          </p>
        </div>

        {/* Cancellations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Cancellations</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.cancellations}</p>
          <p className="text-xs text-gray-500 mt-1">
            Lost revenue: {formatCurrency(analytics.mrr * (analytics.churnRate / 100))}/mo
          </p>
        </div>
      </div>

      {/* Revenue by Tier */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Tier</h3>
        <div className="space-y-4">
          {Object.entries(revenueByTier).map(([tier, data]) => {
            const percentage = analytics.mrr > 0 ? (data.revenue / analytics.mrr) * 100 : 0;
            return (
              <div key={tier}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{tier}</span>
                    <span className="text-sm text-gray-500">({data.count} subscribers)</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(data.revenue)}/mo</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MRR History Chart */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">MRR Trend (30 Days)</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-1">
              {history.slice(-30).map((day, index) => {
                const maxMRR = Math.max(...history.map(h => h.mrr), analytics.mrr);
                const height = maxMRR > 0 ? (day.mrr / maxMRR) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${Math.max(height, 1)}%` }}
                    title={`${new Date(day.date).toLocaleDateString()}: ${formatCurrency(day.mrr)}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{history[0] ? new Date(history[0].date).toLocaleDateString() : ''}</span>
            <span>{history[history.length - 1] ? new Date(history[history.length - 1].date).toLocaleDateString() : ''}</span>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {analytics.mrr > 0 && (
            <li>• Your current MRR is <strong>{formatCurrency(analytics.mrr)}</strong> with a goal of reaching {formatCurrency(analytics.mrr * 1.2)} next month.</li>
          )}
          {analytics.churnRate > 5 && (
            <li>• Churn rate is above 5%. Consider implementing win-back campaigns.</li>
          )}
          {(analytics as any).trialConversions > 0 && (
            <li>• Trial conversions are strong! Focus on optimizing the trial experience.</li>
          )}
          <li>• <strong>{formatCurrency(analytics.arpu)}</strong> average revenue per user - consider premium tier options.</li>
        </ul>
      </div>
    </div>
  );
}
