'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    // Ignore revalidation error in non-request context
  }
}

export async function createWarehouse(data: {
  name: string;
  location: string;
  priority?: number;
  isActive?: boolean;
}) {
  try {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        location: data.location,
        priority: data.priority || 0,
        isActive: data.isActive ?? true,
      },
    });
    safeRevalidatePath('/admin/inventory/warehouses');
    return { success: true, warehouse };
  } catch (error) {
    console.error('Failed to create warehouse:', error);
    return { success: false, error: 'Failed to create warehouse' };
  }
}

export async function updateWarehouse(id: string, data: {
  name?: string;
  location?: string;
  priority?: number;
  isActive?: boolean;
}) {
  try {
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });
    safeRevalidatePath('/admin/inventory/warehouses');
    return { success: true, warehouse };
  } catch (error) {
    console.error('Failed to update warehouse:', error);
    return { success: false, error: 'Failed to update warehouse' };
  }
}

export async function deleteWarehouse(id: string) {
  try {
    await prisma.warehouse.delete({ where: { id } });
    safeRevalidatePath('/admin/inventory/warehouses');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete warehouse:', error);
    return { success: false, error: 'Failed to delete warehouse' };
  }
}

export async function updateInventory(warehouseId: string, productId: string, quantity: number, sku?: string) {
  try {
    const inventory = await prisma.inventory.upsert({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
      update: {
        quantity,
        sku: sku || undefined,
      },
      create: {
        warehouseId,
        productId,
        quantity,
        sku,
      },
    });
    safeRevalidatePath('/admin/inventory');
    return { success: true, inventory };
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
}

export async function createTransfer(data: {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
}) {
  try {
    // Start transaction to check stock
    const result = await prisma.$transaction(async (tx) => {
      // Check source stock
      const sourceInv = await tx.inventory.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: data.sourceWarehouseId,
            productId: data.productId,
          },
        },
      });

      if (!sourceInv || sourceInv.quantity < data.quantity) {
        throw new Error('Insufficient stock in source warehouse');
      }

      // Create transfer record
      const transfer = await tx.inventoryTransfer.create({
        data: {
          sourceWarehouseId: data.sourceWarehouseId,
          targetWarehouseId: data.targetWarehouseId,
          productId: data.productId,
          quantity: data.quantity,
          status: 'PENDING',
          notes: data.notes,
        },
      });

      // Decrement source stock immediately
      await tx.inventory.update({
        where: { id: sourceInv.id },
        data: { quantity: { decrement: data.quantity } },
      });

      return transfer;
    });

    safeRevalidatePath('/admin/inventory/transfers');
    return { success: true, transfer: result };
  } catch (error) {
    console.error('Failed to create transfer:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTransferStatus(transferId: string, status: 'COMPLETED' | 'CANCELLED' | 'FAILED') {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.inventoryTransfer.findUnique({ where: { id: transferId } });
      if (!transfer) throw new Error('Transfer not found');

      if (transfer.status !== 'PENDING') {
         throw new Error('Transfer is not pending');
      }

      if (status === 'COMPLETED') {
        // Add to target warehouse
        const targetInv = await tx.inventory.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.targetWarehouseId,
              productId: transfer.productId,
            },
          },
        });

        if (targetInv) {
          await tx.inventory.update({
            where: { id: targetInv.id },
            data: { quantity: { increment: transfer.quantity } },
          });
        } else {
          await tx.inventory.create({
            data: {
              warehouseId: transfer.targetWarehouseId,
              productId: transfer.productId,
              quantity: transfer.quantity,
            },
          });
        }
      } else if (status === 'CANCELLED' || status === 'FAILED') {
        // Return stock to source warehouse
        const sourceInv = await tx.inventory.findUnique({
          where: {
             warehouseId_productId: {
               warehouseId: transfer.sourceWarehouseId,
               productId: transfer.productId,
             }
          }
        });

        if (sourceInv) {
             await tx.inventory.update({
                 where: { id: sourceInv.id },
                 data: { quantity: { increment: transfer.quantity } }
             });
        } else {
             await tx.inventory.create({
                 data: {
                     warehouseId: transfer.sourceWarehouseId,
                     productId: transfer.productId,
                     quantity: transfer.quantity
                 }
             });
        }
      }

      const updatedTransfer = await tx.inventoryTransfer.update({
        where: { id: transferId },
        data: { status },
      });

      return updatedTransfer;
    });

    safeRevalidatePath('/admin/inventory/transfers');
    return { success: true, transfer: result };

  } catch (error) {
    console.error('Failed to update transfer status:', error);
    return { success: false, error: (error as Error).message };
  }
}
