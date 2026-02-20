import { getWarehouses, getProductsWithTotalInventory } from '@/actions/inventory'

export default async function InventoryDashboard() {
  const warehouses = await getWarehouses()
  const products = await getProductsWithTotalInventory()

  const lowStockThreshold = 10
  const lowStockProducts = products.filter(p => p.totalInventory < lowStockThreshold)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Overview</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Warehouses</h3>
          <p className="mt-2 text-3xl font-bold">{warehouses.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="mt-2 text-3xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="border-b bg-gray-50 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium text-right">Total Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-500">{product.slug}</td>
                    <td className="px-6 py-4 font-bold text-red-600 text-right">{product.totalInventory}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No low stock items found.
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
