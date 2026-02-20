import { getWarehouse } from '@/actions/inventory'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function WarehouseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const warehouse = await getWarehouse(id)

  if (!warehouse) {
    notFound()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
          <p className="text-zinc-500 mt-2">{warehouse.location} • {warehouse.type}</p>
        </div>
        <Link href="/admin/inventory/warehouses" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Warehouses
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Current Inventory</h2>
        </div>
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">SKU/Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">On Hand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Reserved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {warehouse.inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{item.product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                  {item.product.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                  {item.reserved}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-medium ${item.quantity - item.reserved > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.quantity - item.reserved}
                  </span>
                </td>
              </tr>
            ))}
            {warehouse.inventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No inventory in this warehouse.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
