'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Warehouse Management

export async function addWarehouse(data: { name: string; location: string; priority: number }) {
  try {
    const warehouse = await prisma.warehouse.create({
      data: {
        ...data,
        isActive: true,
      },
    });
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true, data: warehouse };
  } catch (error) {
    console.error('Failed to create warehouse:', error);
    return { success: false, error: 'Failed to create warehouse' };
  }
}

export async function updateWarehouse(id: string, data: { name?: string; location?: string; priority?: number; isActive?: boolean }) {
  try {
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true, data: warehouse };
  } catch (error) {
    console.error('Failed to update warehouse:', error);
    return { success: false, error: 'Failed to update warehouse' };
  }
}

export async function getWarehouses() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { priority: 'desc' },
      include: {
        _count: {
          select: { inventory: true },
        },
      },
    });
    return { success: true, data: warehouses };
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return { success: false, error: 'Failed to fetch warehouses' };
  }
}

export async function deleteWarehouse(id: string) {
  try {
    // Check if inventory exists
    const inventoryCount = await prisma.inventory.count({
      where: { warehouseId: id, quantity: { gt: 0 } },
    });

    if (inventoryCount > 0) {
      return { success: false, error: 'Cannot delete warehouse with active inventory' };
    }

    await prisma.warehouse.delete({ where: { id } });
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to delete warehouse:', error);
    return { success: false, error: 'Failed to delete warehouse' };
  }
}

// Inventory Management

export async function updateInventory(productId: string, warehouseId: string, quantity: number) {
  try {
    const inventory = await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      update: { quantity },
      create: {
        productId,
        warehouseId,
        quantity,
      },
    });

    await updateProductInventoryCache(productId);
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true, data: inventory };
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
}

export async function adjustInventory(productId: string, warehouseId: string, delta: number) {
  try {
    const inventory = await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      update: { quantity: { increment: delta } },
      create: {
        productId,
        warehouseId,
        quantity: delta,
      },
    });

    await updateProductInventoryCache(productId);
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true, data: inventory };
  } catch (error) {
    console.error('Failed to adjust inventory:', error);
    return { success: false, error: 'Failed to adjust inventory' };
  }
}

async function updateProductInventoryCache(productId: string) {
  const total = await prisma.inventory.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: { inventoryCount: total._sum.quantity || 0 },
  });
}

// Transfers

export async function createTransfer(data: { productId: string; sourceWarehouseId: string; targetWarehouseId: string; quantity: number }) {
  try {
    // Check source stock
    const sourceInventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.sourceWarehouseId,
        },
      },
    });

    if (!sourceInventory || sourceInventory.quantity < data.quantity) {
      return { success: false, error: 'Insufficient stock in source warehouse' };
    }

    const transfer = await prisma.$transaction(async (tx) => {
      // Create transfer record
      const t = await tx.inventoryTransfer.create({
        data: {
          ...data,
          status: 'PENDING',
        },
      });

      // Decrement source immediately
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.sourceWarehouseId,
          },
        },
        data: { quantity: { decrement: data.quantity } },
      });

      return t;
    });

    await updateProductInventoryCache(data.productId);
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true, data: transfer };
  } catch (error) {
    console.error('Failed to create transfer:', error);
    return { success: false, error: 'Failed to create transfer' };
  }
}

export async function completeTransfer(transferId: string) {
  try {
    const transfer = await prisma.inventoryTransfer.findUnique({ where: { id: transferId } });
    if (!transfer || transfer.status !== 'PENDING') {
      return { success: false, error: 'Invalid transfer' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.inventoryTransfer.update({
        where: { id: transferId },
        data: { status: 'COMPLETED' },
      });

      await tx.inventory.upsert({
        where: {
          productId_warehouseId: {
            productId: transfer.productId,
            warehouseId: transfer.targetWarehouseId,
          },
        },
        update: { quantity: { increment: transfer.quantity } },
        create: {
          productId: transfer.productId,
          warehouseId: transfer.targetWarehouseId,
          quantity: transfer.quantity,
        },
      });
    });

    await updateProductInventoryCache(transfer.productId);
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to complete transfer:', error);
    return { success: false, error: 'Failed to complete transfer' };
  }
}

export async function cancelTransfer(transferId: string) {
    try {
    const transfer = await prisma.inventoryTransfer.findUnique({ where: { id: transferId } });
    if (!transfer || transfer.status !== 'PENDING') {
      return { success: false, error: 'Invalid transfer' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.inventoryTransfer.update({
        where: { id: transferId },
        data: { status: 'CANCELLED' },
      });

      // Refund source warehouse
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: transfer.productId,
            warehouseId: transfer.sourceWarehouseId,
          },
        },
        data: { quantity: { increment: transfer.quantity } },
      });
    });

    await updateProductInventoryCache(transfer.productId);
    try {
      revalidatePath('/admin/inventory');
    } catch (e) {
      // Ignore error outside request context
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel transfer:', error);
    return { success: false, error: 'Failed to cancel transfer' };
  }
}
