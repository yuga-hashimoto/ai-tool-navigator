'use client'

import { transferInventory } from '@/actions/inventory'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface TransferFormProps {
    warehouses: { id: string, name: string }[]
    products: { id: string, name: string }[]
}

export function TransferForm({ warehouses, products }: TransferFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    try {
        const productId = formData.get('productId') as string
        const fromWarehouseId = formData.get('fromWarehouseId') as string
        const toWarehouseId = formData.get('toWarehouseId') as string
        const quantity = parseInt(formData.get('quantity') as string)

        if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
             setError('All fields are required')
             setLoading(false)
             return
        }

        if (fromWarehouseId === toWarehouseId) {
          setError('Source and destination warehouses must be different')
          setLoading(false)
          return
        }

      await transferInventory({
        fromWarehouseId,
        toWarehouseId,
        productId,
        quantity,
      })

      const form = document.getElementById('transfer-form') as HTMLFormElement
      form?.reset()
    } catch {
      setError('Failed to create transfer request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="transfer-form" action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Product</label>
        <select
          name="productId"
          required
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent bg-white dark:bg-zinc-800"
        >
            <option value="">Select Product</option>
            {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select
            name="fromWarehouseId"
            required
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent bg-white dark:bg-zinc-800"
            >
                <option value="">Select Source</option>
                {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select
            name="toWarehouseId"
            required
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent bg-white dark:bg-zinc-800"
            >
                <option value="">Select Dest</option>
                {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          name="quantity"
          type="number"
          min="1"
          required
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50 flex justify-center items-center"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Transfer'}
      </button>
    </form>
  )
}
