"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Copy, Check, Share2, Lock, Unlock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@/lib/analytics';

interface ReferralSystemProps {
  trigger?: React.ReactNode;
}

export function ReferralSystem({ trigger }: ReferralSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [referralId, setReferralId] = useState('');
  const [shareCount, setShareCount] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('ReferralSystem');

  useEffect(() => {
    setMounted(true);
    // Initialize referral data
    let storedId = localStorage.getItem('referral_id');
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('referral_id', storedId);
    }
    setReferralId(storedId);

    const storedShares = parseInt(localStorage.getItem('referral_shares') || '0', 10);
    setShareCount(storedShares);

    // DEMO MODE: Simulate clicks based on shares
    // In a production environment, this data would be fetched from a backend API
    // tracking actual unique visitors via the referral link.
    setClicks(Math.floor(storedShares * 1.5));
  }, []);

  const referralLink = mounted ? `${window.location.origin}/?ref=${referralId}` : '';
  const progress = Math.min(shareCount, 5);
  const isUnlocked = shareCount >= 5;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);

      // Increment share count
      const newCount = shareCount + 1;
      setShareCount(newCount);
      localStorage.setItem('referral_shares', newCount.toString());

      sendGAEvent('share', {
        method: 'referral_link',
        content_type: 'referral',
        item_id: referralId,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    sendGAEvent('view_item', {
        item_id: 'referral_modal',
        item_name: 'Referral System',
    });
  }

  if (!mounted) return null;

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">
        {trigger || (
          <button className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            {t('trigger')}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 pt-8">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Gift className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {t('title')}
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {t('description')}
                </p>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {t('yourLink')}
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 truncate">
                    {referralLink}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t('copied') : t('copy')}
                  </button>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  {t('stats')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-900">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {shareCount}
                    </div>
                    <div className="text-xs text-zinc-500">{t('share')}</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-zinc-900">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {clicks}
                    </div>
                    <div className="text-xs text-zinc-500">{t('clicks')}</div>
                  </div>
                </div>
              </div>

              <div>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {t('rewardTitle')}
                    </span>
                    <span className="text-xs text-zinc-500">
                        {t('progress', { count: progress, total: 5 })}
                    </span>
                 </div>
                 <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(progress / 5) * 100}%` }}
                    />
                 </div>
                 <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        isUnlocked ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                    )}>
                        {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {t('rewardDesc')}
                        </div>
                        {isUnlocked && (
                            <div className="text-xs text-green-600 font-medium">
                                {t('unlocked')}
                            </div>
                        )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
