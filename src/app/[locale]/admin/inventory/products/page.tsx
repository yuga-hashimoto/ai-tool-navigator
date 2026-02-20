import { getProductsWithTotalInventory } from '@/actions/inventory'
import Link from 'next/link'

export default async function ProductInventoryPage() {
  const products = await getProductsWithTotalInventory()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Product Inventory</h2>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium text-right">Total Stock</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-gray-500">{product.slug}</td>
                <td className="px-6 py-4 text-right">{product.totalInventory}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/inventory/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
