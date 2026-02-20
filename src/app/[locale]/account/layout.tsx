import AccountSidebar from '@/components/account/AccountSidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="py-6 lg:col-span-3">
            <AccountSidebar />
          </aside>
          <main className="py-6 lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
