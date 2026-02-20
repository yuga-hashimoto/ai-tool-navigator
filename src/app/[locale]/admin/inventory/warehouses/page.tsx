import { getWarehouses } from '@/actions/inventory'
import WarehouseForm from './_components/WarehouseForm'
import WarehouseList from './_components/WarehouseList'

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Warehouses</h2>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Add New Warehouse</h3>
        <WarehouseForm />
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <WarehouseList warehouses={warehouses} />
      </div>
    </div>
  )
}
