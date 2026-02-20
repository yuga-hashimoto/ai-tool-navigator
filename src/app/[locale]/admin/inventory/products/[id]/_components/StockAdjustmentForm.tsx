'use client'

import { adjustInventory } from '@/actions/inventory'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StockAdjustmentForm({ productId, warehouses }: { productId: string, warehouses: any[] }) {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '')
  const [adjustment, setAdjustment] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adjustInventory(warehouseId, productId, Number(adjustment))
      router.refresh()
      setAdjustment(0)
    } catch (error) {
      console.error(error)
      alert('Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Warehouse</label>
        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Adjustment (add/subtract)</label>
        <input type="number" value={adjustment} onChange={e => setAdjustment(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        <p className="mt-1 text-xs text-gray-500">Positive to add stock, negative to remove.</p>
      </div>
      <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Saving...' : 'Adjust Stock'}
      </button>
    </form>
  )
}
