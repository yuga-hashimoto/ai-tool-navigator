import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Check, X } from 'lucide-react';
import { completeTransfer, cancelTransfer } from '@/actions/inventory';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Inventory Transfers',
};

export default async function TransfersPage() {
  const transfers = await prisma.inventoryTransfer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: true,
      sourceWarehouse: true,
      targetWarehouse: true,
    },
    take: 50,
  });

  async function handleComplete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await completeTransfer(id);
    revalidatePath('/admin/inventory/transfers');
  }

  async function handleCancel(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await cancelTransfer(id);
    revalidatePath('/admin/inventory/transfers');
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Inventory Transfers</h1>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">From</th>
              <th className="px-6 py-3">To</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id} className="bg-white border-b dark:bg-zinc-900 dark:border-zinc-800 last:border-0">
                <td className="px-6 py-4">
                  {new Date(transfer.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {transfer.product.name}
                </td>
                <td className="px-6 py-4">
                  {transfer.sourceWarehouse.name}
                </td>
                <td className="px-6 py-4">
                  {transfer.targetWarehouse.name}
                </td>
                <td className="px-6 py-4">
                  {transfer.quantity}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    transfer.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {transfer.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {transfer.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <form action={handleComplete}>
                        <input type="hidden" name="id" value={transfer.id} />
                        <button type="submit" className="p-1 hover:bg-green-100 text-green-600 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                      </form>
                      <form action={handleCancel}>
                        <input type="hidden" name="id" value={transfer.id} />
                        <button type="submit" className="p-1 hover:bg-red-100 text-red-600 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                  No transfers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
