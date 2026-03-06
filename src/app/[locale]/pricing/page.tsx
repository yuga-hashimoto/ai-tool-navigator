// Pricing Page
// Displays subscription plans and pricing

import { getSubscriptionTiers } from '@/lib/subscriptions/subscription-manager';
import PricingCards from '@/components/subscriptions/PricingCards';
import { Shield, Users, Zap, Clock } from 'lucide-react';

export const metadata = {
  title: 'Pricing - AI Tools Navigator Pro',
  description: 'Compare 500+ AI tools with advanced features. Start free, upgrade when ready.',
};

export default async function PricingPage() {
  // Fetch tiers from database
  const tiers = await getSubscriptionTiers();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Launch Promo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          🎉 <span className="font-bold">LAUNCH20</span> coupon: 20% off your first 3 months • 
          <span className="ml-2 underline cursor-pointer">Limited to first 1000 users</span>
        </p>
      </div>

      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          500+ AI tools compared
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Find Your Perfect AI Tool
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Compare AI tools side-by-side with detailed analysis. Make smarter decisions.
        </p>
        {/* Social Proof Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-900">2,500+</span>
            <span>users</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-gray-900">500+</span>
            <span>AI tools</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="font-semibold text-gray-900">10,000+</span>
            <span>comparisons</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <PricingCards
        tiers={tiers}
      />

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan later?
            </h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. When upgrading,
              you&apos;ll be charged a prorated amount for the remainder of your billing cycle.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards (Visa, Mastercard, American Express)
              through our secure payment processor, Stripe.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600">
              Yes! All paid plans come with a 14-day free trial. No credit card required to start.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600">
              Absolutely. You can cancel your subscription at any time from your account settings.
              You&apos;ll continue to have access until the end of your billing period.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-gray-600">
              We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us
              for a full refund.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            ⏰ Limited time: LAUNCH20 coupon expires soon
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Start Making Smarter AI Tool Decisions Today
          </h2>
          <p className="text-gray-300 mb-8">
            Join 2,500+ users who&apos;ve saved hours researching AI tools.
            No credit card required for free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/tools"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse AI Tools (Free)
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Pro Trial
            </a>
          </div>
          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              30-day money-back
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              🔒 Secure via Stripe
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
