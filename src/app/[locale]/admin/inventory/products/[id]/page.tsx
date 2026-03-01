import { getInventoryByProduct, getWarehouses } from '@/actions/inventory'
import prisma from '@/lib/prisma'
import StockAdjustmentForm from './_components/StockAdjustmentForm'
import TransferForm from './_components/TransferForm'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    return <div>Product not found</div>
  }

  const inventory = await getInventoryByProduct(id)
  const warehouses = await getWarehouses()

  // Map inventory to warehouses to show 0 for empty ones
  const warehouseInventory = warehouses.map(w => {
    const inv = inventory.find(i => i.warehouseId === w.id)
    return {
      warehouse: w,
      quantity: inv ? inv.quantity : 0
    }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Inventory for {product.name}</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
           <div className="rounded-lg border bg-white p-6 shadow-sm">
             <h3 className="mb-4 text-lg font-medium">Current Stock Levels</h3>
             <ul className="divide-y divide-gray-100">
               {warehouseInventory.map(({ warehouse, quantity }) => (
                 <li key={warehouse.id} className="flex justify-between py-3 first:pt-0 last:pb-0">
                   <span>{warehouse.name}</span>
                   <span className={`font-medium ${quantity === 0 ? 'text-red-500' : 'text-gray-900'}`}>{quantity}</span>
                 </li>
               ))}
             </ul>
           </div>

           <div className="rounded-lg border bg-white p-6 shadow-sm">
             <h3 className="mb-4 text-lg font-medium">Adjust Stock</h3>
             <StockAdjustmentForm
               productId={product.id}
               warehouses={warehouses}
             />
           </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
             <h3 className="mb-4 text-lg font-medium">Transfer Stock</h3>
             <TransferForm
                productId={product.id}
                warehouses={warehouses}
                inventory={warehouseInventory}
             />
          </div>
        </div>
      </div>
    </div>
  )
}
