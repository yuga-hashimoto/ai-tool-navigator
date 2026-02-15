'use client';

import { useState } from 'react';
import { UpsellOffer } from '@/types/upsell';
import { X, ShoppingBag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { acceptUpsell, logUpsellAction } from '@/app/actions/upsell';

interface UpsellModalProps {
  purchaseId: string;
  offer: UpsellOffer;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void; // Called when offer is accepted or rejected
}

export function UpsellModal({ purchaseId, offer, isOpen, onClose, onComplete }: UpsellModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAccept = async () => {
    setIsProcessing(true);
    await logUpsellAction(purchaseId, offer.campaignId || 'unknown', offer.id, 'click');

    const result = await acceptUpsell(purchaseId, offer);
    if (result.success) {
      await logUpsellAction(purchaseId, offer.campaignId || 'unknown', offer.id, 'accept');
      onComplete();
    } else {
      // Handle error
      alert('Failed to add to order.');
    }
    setIsProcessing(false);
  };

  const handleDecline = async () => {
    await logUpsellAction(purchaseId, offer.campaignId || 'unknown', offer.id, 'reject');
    onClose();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative animate-in fade-in zoom-in duration-200">

        {/* Close Button */}
        <button
          onClick={handleDecline}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Wait! Special Offer For You
          </h2>

          <p className="text-zinc-500 mb-8">
            Add <span className="font-semibold text-zinc-900 dark:text-zinc-100">{offer.title}</span> to your order now and save!
          </p>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 mb-8 border border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-4 items-start text-left">
              {offer.image ? (
                <img src={offer.image} alt={offer.title} className="w-20 h-20 rounded-lg object-cover bg-white" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-8 h-8 text-zinc-400" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{offer.title}</h3>
                <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{offer.description}</p>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${offer.price.toFixed(2)}
                  </span>
                  {offer.originalPrice && (
                    <span className="text-sm text-zinc-400 line-through">
                      ${offer.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {offer.originalPrice && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      Save {Math.round((1 - offer.price / offer.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Yes, Add to Order - ${offer.price.toFixed(2)}
                </>
              )}
            </button>

            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="w-full py-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors"
            >
              No thanks, I'll pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
