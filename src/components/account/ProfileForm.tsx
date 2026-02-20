'use client';

import { useState } from 'react';

export default function ProfileForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setMessage('Profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400">{message}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={user.name}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white px-3 py-2 border"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            name="email"
            id="email"
            defaultValue={user.email}
            disabled
            className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 px-3 py-2 border cursor-not-allowed"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Street address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="street"
                id="street"
                defaultValue={user.address.street}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white px-3 py-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="city"
                id="city"
                defaultValue={user.address.city}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white px-3 py-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="state"
                id="state"
                defaultValue={user.address.state}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white px-3 py-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ZIP / Postal code
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="zip"
                id="zip"
                defaultValue={user.address.zip}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white px-3 py-2 border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
