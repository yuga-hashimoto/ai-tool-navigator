import { Metadata } from 'next';
import { WarehouseList } from '../_components/WarehouseList';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manage Warehouses',
};

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { priority: 'desc' },
    include: {
      _count: {
        select: { inventory: true },
      },
    },
  });

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Manage Warehouses</h1>
      </div>

      <WarehouseList warehouses={warehouses} />
    </div>
  );
}
