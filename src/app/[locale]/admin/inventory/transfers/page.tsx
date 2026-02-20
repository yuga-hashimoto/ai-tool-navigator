import Link from 'next/link'
import { getTransfers, processTransfer } from '@/actions/inventory'

export default async function TransfersPage() {
  const transfers = await getTransfers()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Transfers</h1>
        <Link
          href="/admin/inventory/transfers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          New Transfer
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transfer.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.fromWarehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.toWarehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      transfer.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {transfer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {transfer.status === 'PENDING' && (
                    <>
                      <form action={async () => {
                        'use server'
                        await processTransfer(transfer.id, 'COMPLETED')
                      }} className="inline">
                        <button type="submit" className="text-green-600 hover:text-green-900">Approve</button>
                      </form>
                      <form action={async () => {
                        'use server'
                        await processTransfer(transfer.id, 'CANCELLED')
                      }} className="inline">
                        <button type="submit" className="text-red-600 hover:text-red-900 ml-2">Cancel</button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            ))}
             {transfers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transfers found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
