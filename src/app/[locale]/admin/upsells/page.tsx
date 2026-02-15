'use client';

import { useState, useEffect } from 'react';
import { createCampaign, getCampaigns } from '@/app/actions/admin-upsell';

type CampaignWithLogs = Awaited<ReturnType<typeof getCampaigns>>[number];

export default function AdminUpsellsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithLogs[]>([]);
  const [name, setName] = useState('');
  const [triggerRules, setTriggerRules] = useState('{"minAmount": 50}');
  const [offers, setOffers] = useState('[{"id": "offer-1", "title": "Premium Add-on", "description": "Get more features", "price": 19.99, "originalPrice": 29.99, "productId": "premium-addon"}]');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const data = await getCampaigns();
    setCampaigns(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await createCampaign({
      name,
      triggerRules,
      offers,
      isActive,
    });
    setName('');
    // Reset to defaults or keep last? Resetting is safer.
    await loadCampaigns();
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">Upsell Campaigns</h1>

      {/* Create Form */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Create New Campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Campaign Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="triggerRules" className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Trigger Rules (JSON)</label>
              <textarea
                id="triggerRules"
                value={triggerRules}
                onChange={e => setTriggerRules(e.target.value)}
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-sm h-32 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Example: {`{"minAmount": 50}`}</p>
            </div>
            <div>
              <label htmlFor="offers" className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Offers (JSON Array)</label>
              <textarea
                id="offers"
                value={offers}
                onChange={e => setOffers(e.target.value)}
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 font-mono text-sm h-32 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Example: {`[{"id": "1", "title": "Pro", "price": 10, "productId": "pro"}]`}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </button>
        </form>
      </div>

      {/* Campaign List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                <th className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">Name</th>
                <th className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">Status</th>
                <th className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">Impressions</th>
                <th className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">Clicks</th>
                <th className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">Accepted</th>
                <th className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">Conv. Rate</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {campaigns.map(campaign => {
                const views = campaign.logs.filter(l => l.action === 'view').length;
                const clicks = campaign.logs.filter(l => l.action === 'click').length;
                const accepts = campaign.logs.filter(l => l.action === 'accept').length;
                const rate = views > 0 ? (accepts / views * 100).toFixed(1) : '0.0';

                return (
                    <tr key={campaign.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">{campaign.name}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{views}</td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{clicks}</td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{accepts}</td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{rate}%</td>
                    </tr>
                );
                })}
                {campaigns.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No campaigns found. Create one to get started.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
