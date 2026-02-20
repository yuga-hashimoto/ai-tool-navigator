'use client'

import { createWarehouse } from '@/actions/inventory'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function WarehouseForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    try {
      await createWarehouse({
        name: formData.get('name') as string,
        location: formData.get('location') as string,
        type: formData.get('type') as string,
      })

      const form = document.getElementById('create-warehouse-form') as HTMLFormElement
      form?.reset()
    } catch {
      setError('Failed to create warehouse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="create-warehouse-form" action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          required
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent"
          placeholder="e.g. Main Warehouse"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          name="location"
          required
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent"
          placeholder="e.g. New York, NY"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          name="type"
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent bg-white dark:bg-zinc-800"
        >
          <option value="PHYSICAL">Physical</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="DROPSHIPPER">Dropshipper</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50 flex justify-center items-center"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Warehouse'}
      </button>
    </form>
  )
}
