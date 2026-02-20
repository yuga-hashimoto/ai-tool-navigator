import { createTransfer, getWarehouses } from '@/actions/inventory'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewTransferPage() {
  const warehouses = await getWarehouses()
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  async function action(formData: FormData) {
    'use server'
    const fromWarehouseId = formData.get('fromWarehouseId') as string
    const toWarehouseId = formData.get('toWarehouseId') as string
    const productId = formData.get('productId') as string
    const quantity = parseInt(formData.get('quantity') as string || '0')
    const notes = formData.get('notes') as string

    await createTransfer({ fromWarehouseId, toWarehouseId, productId, quantity, notes })
    redirect('/admin/inventory/transfers')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">New Transfer</h1>
      <form action={action} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fromWarehouseId" className="block text-sm font-medium text-gray-700">From Warehouse</label>
            <select name="fromWarehouseId" id="fromWarehouseId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
              <option value="">Select Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="toWarehouseId" className="block text-sm font-medium text-gray-700">To Warehouse</label>
            <select name="toWarehouseId" id="toWarehouseId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
              <option value="">Select Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Product</label>
          <select name="productId" id="productId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input type="number" name="quantity" id="quantity" min="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea name="notes" id="notes" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"></textarea>
        </div>

        <div className="flex justify-end space-x-3">
            <Link href="/admin/inventory/transfers" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Transfer</button>
        </div>
      </form>
    </div>
  )
}
