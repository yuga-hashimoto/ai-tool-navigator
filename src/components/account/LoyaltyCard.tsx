import { Gift, Award } from 'lucide-react';
import { LoyaltyAccount } from '@prisma/client';
import { LOYALTY_TIERS } from '@/lib/loyalty/loyalty-core';

interface LoyaltyCardProps {
  loyalty: LoyaltyAccount;
}

export default function LoyaltyCard({ loyalty }: LoyaltyCardProps) {
  const tierConfig = LOYALTY_TIERS[loyalty.tier as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.BRONZE;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Available Points</p>
            <h3 className="text-3xl font-bold">{loyalty.points.toLocaleString()}</h3>
          </div>
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Gift className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium flex items-center">
              <Award className="h-4 w-4 mr-1" />
              {tierConfig.displayName} Member
            </span>
            <span className="text-blue-100">Lifetime: {loyalty.lifetimePoints.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
    </div>
  );
}
