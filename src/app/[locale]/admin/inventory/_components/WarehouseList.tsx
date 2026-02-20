'use client';

import { useState } from 'react';
import { WarehouseForm } from './WarehouseForm';
import { deleteWarehouse } from '@/actions/inventory';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Warehouse {
  id: string;
  name: string;
  location: string;
  priority: number;
  isActive: boolean;
  _count?: {
    inventory: number;
  };
}

interface WarehouseListProps {
  warehouses: Warehouse[];
}

export function WarehouseList({ warehouses }: WarehouseListProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      await deleteWarehouse(id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Warehouses</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
           <WarehouseForm
             onSuccess={() => { setIsAdding(false); router.refresh(); }}
           />
           <button
             onClick={() => setIsAdding(false)}
             className="mt-2 text-sm text-zinc-500 hover:text-zinc-700"
           >
             Cancel
           </button>
        </div>
      )}

      <div className="grid gap-4">
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-start">
            {isEditing === warehouse.id ? (
              <div className="w-full">
                <WarehouseForm
                  initialData={warehouse}
                  onSuccess={() => { setIsEditing(null); router.refresh(); }}
                />
                <button
                    onClick={() => setIsEditing(null)}
                    className="mt-2 text-sm text-zinc-500 hover:text-zinc-700"
                >
                    Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {warehouse.name}
                    {!warehouse.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Inactive</span>
                    )}
                  </h3>
                  <p className="text-zinc-500">{warehouse.location}</p>
                  <div className="mt-2 text-sm text-zinc-500 flex gap-4">
                    <span>Priority: {warehouse.priority}</span>
                    <span>Items: {warehouse._count?.inventory || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(warehouse.id)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-zinc-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(warehouse.id)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
