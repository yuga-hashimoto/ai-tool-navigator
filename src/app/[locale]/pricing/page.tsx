// Pricing Page
// Displays subscription plans and pricing

import { getSubscriptionTiers } from '@/lib/subscriptions/subscription-manager';
import PricingCards from '@/components/subscriptions/PricingCards';

export const metadata = {
  title: 'Pricing - Subscription Plans',
  description: 'Choose the perfect plan for your needs',
};

export default async function PricingPage() {
  // Fetch tiers from database
  const tiers = await getSubscriptionTiers();
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
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
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of satisfied users already using our platform.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Your Free Trial
          </a>
        </div>
      </section>
    </main>
  );
}
