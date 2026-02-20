// Customer Portal Component
// Subscription management dashboard for customers

'use client';

import { useState, useEffect } from 'react';
import { getSubscription } from '@/actions/account';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Subscription {
  id: string;
  status: string;
  isTrial: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  tier: {
    id: string;
    name: string;
    slug: string;
    price: number;
    features: string[];
  };
  billingHistory?: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    description: string | null;
  }>;
}

interface CustomerPortalProps {
  userId: string;
  userEmail: string;
  isAuthenticated: boolean;
}

export default function CustomerPortal({
  userId,
  userEmail,
  isAuthenticated,
}: CustomerPortalProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchSubscription();
    }
  }, [userId, isAuthenticated]);

  const fetchSubscription = async () => {
    try {
      // Use Server Action
      const result = await getSubscription();
      
      if (result && result.success && result.data) {
        setSubscription(result.data as Subscription);
      } else {
        setError('Failed to load subscription');
      }
    } catch (_err) {
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.portalUrl) {
        window.open(data.data.portalUrl, '_blank');
      } else {
        setError(data.error || 'Failed to open portal');
      }
    } catch (_err) {
      setError('Failed to open customer portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    if (subscription.isTrial) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Trial
        </span>
      );
    }
    
    switch (subscription.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case 'PAST_DUE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Payment Required
          </span>
        );
      case 'CANCELED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {subscription.status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sign in to Manage Your Subscription
        </h2>
        <p className="text-gray-600 mb-6">
          Access your subscription dashboard to view plans, billing history, and more.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchSubscription}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          No Active Subscription
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a plan that fits your needs.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600">{userEmail}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {subscription.tier.name}
            </h2>
            <p className="text-gray-600">
              {formatCurrency(subscription.tier.price)}/month
            </p>
            
            {/* Trial or Renewal Info */}
            {subscription.isTrial && subscription.trialEndsAt && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Your trial ends on {formatDate(subscription.trialEndsAt)}
                </p>
              </div>
            )}
            
            {/* Renewal/Cancellation Info */}
            {subscription.currentPeriodEnd && !subscription.isTrial && (
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                {subscription.cancelAtPeriodEnd ? (
                  <span>
                    Access until {formatDate(subscription.currentPeriodEnd)} (canceled)
                  </span>
                ) : (
                  <span>
                    Next billing date: {formatDate(subscription.currentPeriodEnd)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!subscription.isTrial && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={() => setChangingPlan(!changingPlan)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {changingPlan ? (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    Cancel Change
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Change Plan
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Manage Billing
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        {subscription.tier.features.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {subscription.tier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Change Plan Section */}
      {changingPlan && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose a New Plan
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Changes take effect immediately. You&apos;ll be charged or credited a prorated amount.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Billing History */}
      {subscription.billingHistory && subscription.billingHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Billing History
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscription.billingHistory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-3 text-sm text-gray-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-3 text-sm text-gray-900">
                      {item.description || item.type}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'SUCCEEDED' 
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'FAILED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status === 'SUCCEEDED' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-700 text-sm">
            Want to cancel your subscription? You can do this anytime from your billing portal.
          </p>
          <button
            onClick={openCustomerPortal}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Cancel Subscription →
          </button>
        </div>
      )}
    </div>
  );
}
