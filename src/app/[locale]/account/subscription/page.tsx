// Account Subscription Page
// Customer portal for managing subscription

import { headers } from 'next/headers';
import CustomerPortal from '@/components/subscriptions/CustomerPortal';
// import { getServerSession } from 'next-auth'; // Commented out to fix build

export const metadata = {
  title: 'My Subscription - Account',
  description: 'Manage your subscription and billing',
};

export default async function AccountSubscriptionPage() {
  // Get current user session
  // This is a placeholder - implement according to your auth system
  // const session = await getServerSession();

  // Mock session for now as next-auth is not installed
  const session = {
    user: {
      id: 'mock-user-id',
      email: 'mock@example.com',
    }
  };
  
  const userId = session?.user?.id || '';
  const userEmail = session?.user?.email || '';
  const isAuthenticated = !!session;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <CustomerPortal
          userId={userId}
          userEmail={userEmail}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </main>
  );
}
