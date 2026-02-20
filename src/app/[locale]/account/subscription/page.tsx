// Account Subscription Page
// Customer portal for managing subscription

import CustomerPortal from '@/components/subscriptions/CustomerPortal';
import { getUser } from '@/actions/account';

export const metadata = {
  title: 'My Subscription - Account',
  description: 'Manage your subscription and billing',
};

export default async function AccountSubscriptionPage() {
  const user = await getUser();
  
  const userId = user.id;
  const userEmail = user.email;
  const isAuthenticated = true;

  return (
    <div className="space-y-6">
      <CustomerPortal
        userId={userId}
        userEmail={userEmail}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
