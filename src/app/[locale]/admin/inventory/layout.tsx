import Link from 'next/link'

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Inventory Management</h1>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="/admin/inventory" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link href="/admin/inventory/warehouses" className="text-gray-600 hover:text-blue-600">Warehouses</Link>
            <Link href="/admin/inventory/products" className="text-gray-600 hover:text-blue-600">Products</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  )
}
