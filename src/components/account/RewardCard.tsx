'use client';

import { useState } from 'react';
import { Gift, Loader2, Check } from 'lucide-react';

interface Reward {
  id: string; // usually name/code in static config
  displayName: string;
  pointsCost: number;
  description: string;
}

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (id: string, cost: number) => Promise<{ success: boolean; error?: string }>;
}

export default function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canRedeem = userPoints >= reward.pointsCost;

  const handleRedeem = async () => {
    if (!canRedeem || loading) return;

    setLoading(true);
    const result = await onRedeem(reward.id, reward.pointsCost);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(result.error || 'Redemption failed');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col h-full">
      <div className="flex-1">
        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
          <Gift className="h-5 w-5 text-blue-600" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">{reward.displayName}</h4>
        <p className="text-sm text-gray-500 mb-4">{reward.description}</p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-900">{reward.pointsCost} pts</span>
        </div>

        <button
          onClick={handleRedeem}
          disabled={!canRedeem || loading || success}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center
            ${success
              ? 'bg-green-100 text-green-700'
              : canRedeem
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : success ? (
            <>
              <Check className="h-4 w-4 mr-2" /> Redeemed
            </>
          ) : (
            'Redeem'
          )}
        </button>
      </div>
    </div>
  );
}
