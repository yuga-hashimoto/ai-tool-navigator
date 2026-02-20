'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/account';
import { Loader2 } from 'lucide-react';

export default function PreferencesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage('');

    const name = formData.get('name') as string;

    const result = await updateProfile({ name });

    setLoading(false);
    if (result.success) {
      setMessage('Profile updated successfully');
    } else {
      setMessage(result.error || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form action={handleSubmit} className="space-y-6 max-w-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Your Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
