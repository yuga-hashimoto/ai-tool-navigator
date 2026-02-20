import { getLoyaltyData, redeemReward } from '@/actions/account';
import LoyaltyCard from '@/components/account/LoyaltyCard';
import PointHistory from '@/components/account/PointHistory';
import RewardCard from '@/components/account/RewardCard';
import { REWARDS } from '@/lib/loyalty/loyalty-core';

export default async function LoyaltyPage() {
  const { loyalty, history } = await getLoyaltyData();

  const availableRewards = REWARDS.filter(r => r.isActive);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Loyalty & Rewards</h1>
        <LoyaltyCard loyalty={loyalty} />
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.map((reward) => (
            <RewardCard
              key={reward.name}
              reward={{...reward, id: reward.name}}
              userPoints={loyalty.points}
              onRedeem={redeemReward}
            />
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Point History</h2>
        </div>
        <PointHistory transactions={history} />
      </div>
    </div>
  );
}
