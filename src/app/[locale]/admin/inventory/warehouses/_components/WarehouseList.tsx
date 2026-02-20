'use client'

import { deleteWarehouse, updateWarehouse } from '@/actions/inventory'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WarehouseList({ warehouses }: { warehouses: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      await deleteWarehouse(id)
      router.refresh()
    }
  }

  const handleToggle = async (warehouse: any) => {
      await updateWarehouse(warehouse.id, { isEnabled: !warehouse.isEnabled })
      router.refresh()
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-gray-500">
        <tr>
          <th className="px-6 py-3 font-medium">Name</th>
          <th className="px-6 py-3 font-medium">Location</th>
          <th className="px-6 py-3 font-medium">Priority</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {warehouses.map(warehouse => (
          <tr key={warehouse.id}>
            <td className="px-6 py-4 font-medium text-gray-900">{warehouse.name}</td>
            <td className="px-6 py-4 text-gray-500">{warehouse.location || '-'}</td>
            <td className="px-6 py-4 text-gray-500">{warehouse.priority}</td>
            <td className="px-6 py-4">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${warehouse.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {warehouse.isEnabled ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
               <button onClick={() => handleToggle(warehouse)} className="text-blue-600 hover:text-blue-900">
                  {warehouse.isEnabled ? 'Disable' : 'Enable'}
               </button>
               <button onClick={() => handleDelete(warehouse.id)} className="text-red-600 hover:text-red-900">
                  Delete
               </button>
            </td>
          </tr>
        ))}
         {warehouses.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No warehouses found.
              </td>
            </tr>
          )}
      </tbody>
    </table>
  )
}
