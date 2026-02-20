'use client';

import { LoyaltyDashboard } from '@/components/loyalty/LoyaltyDashboard';

export default function LoyaltyPage() {
  // In a real app, userId would come from the session context
  const userId = 'mock-user-id';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Loyalty & Rewards</h1>
      <LoyaltyDashboard userId={userId} />
    </div>
  );
}
