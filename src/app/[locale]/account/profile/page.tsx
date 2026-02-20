import { MOCK_USER } from '@/lib/mock-data';
import ProfileForm from '@/components/account/ProfileForm';

export const metadata = {
  title: 'Profile Settings - Account',
  description: 'Manage your profile information',
};

export default function ProfilePage() {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>
      <ProfileForm user={MOCK_USER} />
    </div>
  );
}
