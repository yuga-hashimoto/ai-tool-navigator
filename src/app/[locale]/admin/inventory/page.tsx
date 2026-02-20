import { getWarehouses, getInventory } from '@/actions/inventory'

export default async function InventoryDashboard() {
  const warehouses = await getWarehouses()
  const allInventory = await getInventory()

  const totalStock = allInventory.reduce((sum, item) => sum + item.quantity, 0)
  const activeWarehouses = warehouses.filter(w => w.isActive).length
  const productCount = new Set(allInventory.map(i => i.productId)).size

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Inventory Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Items in Stock</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalStock}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Active Warehouses</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{activeWarehouses} <span className="text-sm font-normal text-gray-500">/ {warehouses.length}</span></p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Unique Products</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{productCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Warehouse Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Count</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse._count.inventory} items</td>
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
    </div>
  )
}
