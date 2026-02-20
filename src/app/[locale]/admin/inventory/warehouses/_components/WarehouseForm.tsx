'use client'

import { createWarehouse } from '@/actions/inventory'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

type FormData = {
  name: string
  location: string
  priority: number
  isEnabled: boolean
}

export default function WarehouseForm() {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await createWarehouse({
        name: data.name,
        location: data.location,
        priority: Number(data.priority),
        isEnabled: Boolean(data.isEnabled)
      })
      reset()
    } catch (error) {
      console.error(error)
      alert('Failed to create warehouse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input {...register('name', { required: true })} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input {...register('location')} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <input type="number" {...register('priority')} defaultValue={0} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        <div className="flex items-center space-x-2 pb-2">
           <input type="checkbox" {...register('isEnabled')} defaultChecked className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
           <label className="text-sm font-medium text-gray-700">Enabled</label>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Warehouse'}
        </button>
      </div>
    </form>
  )
}
