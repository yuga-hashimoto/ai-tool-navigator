import prisma from '@/lib/prisma';
import { createTransfer, updateTransferStatus } from '@/actions/inventory';
import { Link } from '@/i18n/routing';

export default async function TransfersPage() {
  const transfers = await prisma.inventoryTransfer.findMany({
    include: {
      sourceWarehouse: true,
      targetWarehouse: true,
      product: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true }
  });

  const products = await prisma.product.findMany();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Transfers</h1>
        <Link href="/admin/inventory" className="text-blue-600 hover:underline">
          &larr; Back to Inventory
        </Link>
      </div>

      {/* Create Form */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Transfer</h2>
        <form action={async (formData) => {
          'use server';
          await createTransfer({
            sourceWarehouseId: formData.get('sourceWarehouseId') as string,
            targetWarehouseId: formData.get('targetWarehouseId') as string,
            productId: formData.get('productId') as string,
            quantity: parseInt(formData.get('quantity') as string),
            notes: formData.get('notes') as string
          });
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Source Warehouse</label>
            <select name="sourceWarehouseId" required className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="">Select Source</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Warehouse</label>
            <select name="targetWarehouseId" required className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="">Select Target</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select name="productId" required className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700">
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input name="quantity" type="number" min="1" required className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input name="notes" type="text" className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div className="md:col-span-2">
             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Transfer
             </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-800">
            {transfers.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.createdAt.toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t.sourceWarehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t.targetWarehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.product.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {t.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {t.status === 'PENDING' && (
                    <>
                      <form action={async () => {
                          'use server';
                          await updateTransferStatus(t.id, 'COMPLETED');
                      }} className="inline">
                          <button type="submit" className="text-green-600 hover:text-green-900 ml-4">Complete</button>
                      </form>
                      <form action={async () => {
                          'use server';
                          await updateTransferStatus(t.id, 'CANCELLED');
                      }} className="inline">
                          <button type="submit" className="text-red-600 hover:text-red-900 ml-4">Cancel</button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
