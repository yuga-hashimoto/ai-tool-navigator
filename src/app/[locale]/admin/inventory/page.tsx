import { Metadata } from 'next';
import { InventoryTable } from './_components/InventoryTable';
import { TransferForm } from './_components/TransferForm';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Inventory Management',
};

export default async function InventoryPage() {
  // Fetch stats
  const totalProducts = await prisma.product.count();
  const lowStock = await prisma.product.count({
    where: { inventoryCount: { lt: 10 } }
  });
  const warehouses = await prisma.warehouse.count();

  // Fetch products with inventory
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: { warehouse: true }
      }
    },
    take: 50 // Pagination later?
  });

  const inventoryItems = products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    inventoryCount: p.inventoryCount,
    inventory: p.inventory.map(i => ({
      warehouseId: i.warehouseId,
      warehouse: { name: i.warehouse.name },
      quantity: i.quantity
    }))
  }));

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Inventory Dashboard</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/inventory/warehouses"
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Manage Warehouses
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500">Total Products</h3>
          <p className="text-2xl font-bold mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500">Low Stock Items</h3>
          <p className="text-2xl font-bold mt-2 text-orange-500">{lowStock}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500">Warehouses</h3>
          <p className="text-2xl font-bold mt-2">{warehouses}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Stock Overview</h2>
          </div>
          <InventoryTable products={inventoryItems} />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
             <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Quick Transfer</h2>
             <TransferForm />
          </div>
        </div>
      </div>
    </div>
  );
}
