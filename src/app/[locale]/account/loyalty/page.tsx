import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
import RewardsCatalog from '@/components/loyalty/RewardsCatalog';
import { getUser } from '@/actions/account';
import { LoyaltyTier } from '@/lib/loyalty/loyalty-types';

export const metadata = {
  title: 'Loyalty & Rewards - Account',
};

export default async function LoyaltyPage() {
  const user = await getUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loyalty Program</h1>
        <p className="text-gray-600">Earn points and unlock exclusive rewards.</p>
      </div>

      <LoyaltyDashboard userId={user.id} />

      <div id="rewards-catalog" className="pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Redeem Rewards</h2>
        <RewardsCatalog
          userPoints={user.loyaltyAccount?.points}
          userTier={user.loyaltyAccount?.tier as LoyaltyTier}
        />
      </div>
    </div>
  );
}
