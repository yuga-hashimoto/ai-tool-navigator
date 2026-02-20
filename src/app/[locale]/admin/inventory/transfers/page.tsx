import { getTransfers, getWarehouses } from '@/actions/inventory'
import { TransferForm } from './_components/TransferForm'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import prisma from '@/lib/prisma'

export default async function TransfersPage() {
  const transfers = await getTransfers()
  const warehouses = await getWarehouses()
  // Fetch products for the form
  const products = await prisma.product.findMany({ select: { id: true, name: true } })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Transfers</h1>
          <p className="text-zinc-500 mt-2">Manage stock movements between warehouses.</p>
        </div>
        <Link href="/admin/inventory" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{transfer.product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <span>{transfer.fromWarehouse.name}</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>{transfer.toWarehouse.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{transfer.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-100'
                      }`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-500">
                       {new Date(transfer.requestedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No transfers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Request Transfer</h2>
            <TransferForm warehouses={warehouses} products={products} />
          </div>
        </div>
      </div>
    </div>
  )
}
