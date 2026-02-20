import { getWarehouses } from '@/actions/inventory'
import Link from 'next/link'
import { ArrowLeft, Box, Truck } from 'lucide-react'

export default async function InventoryDashboard() {
  const warehouses = await getWarehouses()

  const totalStock = warehouses.reduce((sum, w) => sum + (w._count?.inventory || 0), 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-zinc-500 mt-2">Manage warehouses, stock levels, and transfers.</p>
        </div>
        <Link href="/admin" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Warehouses</p>
              <h3 className="text-2xl font-bold">{warehouses.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Products Tracked</p>
              <h3 className="text-2xl font-bold">{totalStock}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Inventory Transfers</p>
              <h3 className="text-2xl font-bold">Manage</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/admin/inventory/warehouses" className="block group">
          <div className="h-full bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-blue-500 transition-colors">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">Manage Warehouses</h3>
            <p className="text-zinc-500">Add, edit, and view inventory for each warehouse location.</p>
          </div>
        </Link>

        <Link href="/admin/inventory/transfers" className="block group">
          <div className="h-full bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-blue-500 transition-colors">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">Inventory Transfers</h3>
            <p className="text-zinc-500">Move stock between warehouses and track shipments.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
