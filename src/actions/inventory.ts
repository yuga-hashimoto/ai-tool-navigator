'use server'

import prisma from '@/lib/prisma'
import { revalidatePath as nextRevalidatePath } from 'next/cache'

function revalidatePath(path: string) {
  try {
    nextRevalidatePath(path)
  } catch (error) {
    // Ignore error in non-Next.js context (e.g. scripts)
  }
}

export async function getWarehouses() {
  return await prisma.warehouse.findMany({
    orderBy: { priority: 'desc' },
  })
}

export async function createWarehouse(data: { name: string; location?: string; priority?: number; isEnabled?: boolean }) {
  const warehouse = await prisma.warehouse.create({
    data: {
      name: data.name,
      location: data.location,
      priority: data.priority ?? 0,
      isEnabled: data.isEnabled ?? true,
    },
  })
  revalidatePath('/admin/inventory')
  return warehouse
}

export async function updateWarehouse(id: string, data: { name?: string; location?: string; priority?: number; isEnabled?: boolean }) {
  const warehouse = await prisma.warehouse.update({
    where: { id },
    data,
  })
  revalidatePath('/admin/inventory')
  return warehouse
}

export async function deleteWarehouse(id: string) {
  await prisma.warehouse.delete({
    where: { id },
  })
  revalidatePath('/admin/inventory')
}

export async function getInventoryByProduct(productId: string) {
  return await prisma.inventory.findMany({
    where: { productId },
    include: { warehouse: true },
  })
}

export async function getProductsWithTotalInventory() {
  const products = await prisma.product.findMany({
    include: {
      inventoryItems: true
    }
  })

  return products.map(p => ({
    ...p,
    totalInventory: p.inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  }))
}

export async function adjustInventory(warehouseId: string, productId: string, delta: number) {
  const existing = await prisma.inventory.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
  })

  if (existing) {
    const newQuantity = existing.quantity + delta
    await prisma.inventory.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    })
  } else {
    if (delta < 0) throw new Error("Cannot reduce inventory below 0 for new item")
    await prisma.inventory.create({
      data: {
        warehouseId,
        productId,
        quantity: delta,
      },
    })
  }
  revalidatePath('/admin/inventory')
}

export async function setInventory(warehouseId: string, productId: string, quantity: number) {
  const existing = await prisma.inventory.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
  })

  if (existing) {
    await prisma.inventory.update({
      where: { id: existing.id },
      data: { quantity },
    })
  } else {
    await prisma.inventory.create({
      data: {
        warehouseId,
        productId,
        quantity,
      },
    })
  }
  revalidatePath('/admin/inventory')
}

export async function transferInventory(sourceWarehouseId: string, targetWarehouseId: string, productId: string, quantity: number, notes?: string) {
  // Using explicit transaction
  const result = await prisma.$transaction(async (tx) => {
    // Check source
    const sourceInv = await tx.inventory.findUnique({
      where: { productId_warehouseId: { productId, warehouseId: sourceWarehouseId } },
    })

    if (!sourceInv || sourceInv.quantity < quantity) {
      throw new Error('Insufficient stock in source warehouse')
    }

    // Deduct from source
    await tx.inventory.update({
      where: { id: sourceInv.id },
      data: { quantity: sourceInv.quantity - quantity },
    })

    // Add to target
    const targetInv = await tx.inventory.findUnique({
      where: { productId_warehouseId: { productId, warehouseId: targetWarehouseId } },
    })

    if (targetInv) {
      await tx.inventory.update({
        where: { id: targetInv.id },
        data: { quantity: targetInv.quantity + quantity },
      })
    } else {
      await tx.inventory.create({
        data: {
          productId,
          warehouseId: targetWarehouseId,
          quantity,
        },
      })
    }

    // Record transfer
    const transfer = await tx.inventoryTransfer.create({
      data: {
        sourceWarehouseId,
        targetWarehouseId,
        productId,
        quantity,
        status: 'COMPLETED',
        notes,
        processedAt: new Date(),
      },
    })

    return transfer
  })

  revalidatePath('/admin/inventory')
  return result
}
