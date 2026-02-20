import AccountNavigation from '@/components/account/AccountNavigation';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-4">My Account</h2>
            <AccountNavigation />
          </aside>

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
             <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg">
                {children}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
