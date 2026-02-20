'use client'

import { transferInventory } from '@/actions/inventory'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TransferForm({ productId, warehouses, inventory }: { productId: string, warehouses: any[], inventory: any[] }) {
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (warehouses.length > 0) {
        setSourceId(warehouses[0].id)
    }
    if (warehouses.length > 1) {
        setTargetId(warehouses[1].id)
    } else if (warehouses.length === 1) {
        setTargetId(warehouses[0].id)
    }
  }, [warehouses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sourceId === targetId) {
      alert('Source and target cannot be the same')
      return
    }
    setLoading(true)
    try {
      await transferInventory(sourceId, targetId, productId, Number(quantity))
      router.refresh()
      setQuantity(0)
    } catch (error) {
      alert('Transfer failed: ' + (error as any).message)
    } finally {
      setLoading(false)
    }
  }

  const getSourceStock = () => {
      const inv = inventory.find(i => i.warehouse.id === sourceId)
      return inv ? inv.quantity : 0
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Source Warehouse</label>
        <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          {warehouses.map(w => {
            const stock = inventory.find(i => i.warehouse.id === w.id)?.quantity || 0
            return <option key={w.id} value={w.id}>{w.name} (Stock: {stock})</option>
          })}
        </select>
        <p className="mt-1 text-xs text-gray-500">Available: {getSourceStock()}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Target Warehouse</label>
        <select value={targetId} onChange={e => setTargetId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Quantity to Transfer</label>
        <input type="number" min="1" max={getSourceStock()} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
      </div>
      <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Processing...' : 'Transfer Stock'}
      </button>
    </form>
  )
}
