import prisma from '@/lib/prisma';
import { createWarehouse, deleteWarehouse, updateWarehouse } from '@/actions/inventory';
import { Link } from '@/i18n/routing';

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { priority: 'desc' }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Warehouses</h1>
        <Link href="/admin/inventory" className="text-blue-600 hover:underline">
          &larr; Back to Inventory
        </Link>
      </div>

      {/* Create Form */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Warehouse</h2>
        <form action={async (formData) => {
          'use server';
          await createWarehouse({
            name: formData.get('name') as string,
            location: formData.get('location') as string,
            priority: parseInt(formData.get('priority') as string) || 0,
            isActive: true
          });
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" type="text" required className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input name="location" type="text" required className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <input name="priority" type="number" defaultValue="0" className="w-full border rounded px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Warehouse
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-800">
            {warehouses.map((w) => (
              <tr key={w.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{w.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${w.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {w.isActive ? 'Active' : 'Inactive'}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={async () => {
                      'use server';
                      await deleteWarehouse(w.id);
                  }} className="inline">
                      <button type="submit" className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                  </form>
                  {/* Toggle Status */}
                  <form action={async () => {
                      'use server';
                      await updateWarehouse(w.id, { isActive: !w.isActive });
                  }} className="inline">
                      <button type="submit" className="text-indigo-600 hover:text-indigo-900 ml-4">
                          {w.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
