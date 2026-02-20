import { getWarehouse, updateWarehouse } from '@/actions/inventory'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EditWarehousePage({ params }: { params: { id: string } }) {
  const warehouse = await getWarehouse(params.id)

  if (!warehouse) {
    return <div>Warehouse not found</div>
  }

  async function action(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const priority = parseInt(formData.get('priority') as string || '0')
    const isActive = formData.get('isActive') === 'on'

    await updateWarehouse(params.id, { name, location, priority, isActive })
    redirect('/admin/inventory/warehouses')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Warehouse</h1>
      <form action={action} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" id="name" defaultValue={warehouse.name} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" name="location" id="location" defaultValue={warehouse.location || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority (Higher = First)</label>
          <input type="number" name="priority" id="priority" defaultValue={warehouse.priority} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="isActive" id="isActive" defaultChecked={warehouse.isActive} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
        </div>
        <div className="flex justify-end space-x-3">
            <Link href="/admin/inventory/warehouses" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
        </div>
      </form>
    </div>
  )
}
