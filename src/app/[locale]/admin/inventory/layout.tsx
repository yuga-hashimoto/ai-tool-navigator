import React from 'react'
import Link from 'next/link'

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Inventory</h2>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          <Link href="/admin/inventory" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Dashboard</Link>
          <Link href="/admin/inventory/warehouses" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Warehouses</Link>
          <Link href="/admin/inventory/transfers" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Transfers</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
