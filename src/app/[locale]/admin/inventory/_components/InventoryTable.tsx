'use client';

import { useState } from 'react';
import { updateInventory } from '@/actions/inventory';
import { Loader2 } from 'lucide-react';

interface InventoryItem {
  id: string; // Product ID
  name: string;
  slug: string;
  inventoryCount: number;
  inventory: {
    warehouseId: string;
    warehouse: { name: string };
    quantity: number;
  }[];
}

interface InventoryTableProps {
  products: InventoryItem[];
}

export function InventoryTable({ products }: InventoryTableProps) {
  // Simple table showing product and stock per warehouse
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Total Stock</th>
            <th className="px-6 py-3">Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="bg-white border-b dark:bg-zinc-900 dark:border-zinc-800 last:border-0">
              <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                {product.name}
                <div className="text-xs text-zinc-500">{product.slug}</div>
              </td>
              <td className="px-6 py-4">
                {product.inventoryCount}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {product.inventory.map(inv => (
                    <div key={inv.warehouseId} className="flex justify-between text-xs w-48">
                      <span>{inv.warehouse.name}:</span>
                      <span className="font-medium">{inv.quantity}</span>
                    </div>
                  ))}
                  {product.inventory.length === 0 && (
                    <span className="text-zinc-400 italic">No stock allocated</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
