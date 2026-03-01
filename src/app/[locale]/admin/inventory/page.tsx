import prisma from '@/lib/prisma';
import { Link } from '@/i18n/routing';

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: {
          warehouse: true
        }
      }
    }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="space-x-4">
          <Link href="/admin/inventory/warehouses" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Manage Warehouses
          </Link>
          <Link href="/admin/inventory/transfers" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Manage Transfers
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakdown</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-800">
            {products.map((product) => {
              const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 space-y-1">
                      {product.inventory.map(inv => (
                        <div key={inv.warehouseId} className="flex justify-between max-w-xs">
                          <span>{inv.warehouse.name}:</span>
                          <span className="font-mono">{inv.quantity}</span>
                        </div>
                      ))}
                      {product.inventory.length === 0 && <span className="text-gray-400 italic">No stock records</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
