// Subscription Success Page
// Shown after successful checkout

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Subscription Active - Welcome!',
  description: 'Your subscription has been activated',
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SubscriptionSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Premium! 🎉
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your subscription has been successfully activated. 
          You now have access to all premium features.
        </p>

        {/* What's Next */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-4">What&apos;s Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </span>
              <span className="text-gray-600 text-sm">
                Check your email for confirmation and receipt
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </span>
              <span className="text-gray-600 text-sm">
                Explore your new premium features in your dashboard
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </span>
              <span className="text-gray-600 text-sm">
                Set up your preferences in your account settings
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account/subscription"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Subscription
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Billing Note */}
        <p className="mt-8 text-xs text-gray-500">
          Questions about your subscription?{' '}
          <a href="/support" className="text-blue-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </main>
  );
}
