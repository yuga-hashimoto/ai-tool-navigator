import Link from 'next/link'
import { getWarehouses, deleteWarehouse } from '@/actions/inventory'

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
        <Link
          href="/admin/inventory/warehouses/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Warehouse
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.location || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link href={`/admin/inventory/warehouses/${warehouse.id}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                  <form action={async () => {
                    'use server'
                    await deleteWarehouse(warehouse.id)
                  }} className="inline">
                    <button type="submit" className="text-red-600 hover:text-red-900 ml-2">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
             {warehouses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No warehouses found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
