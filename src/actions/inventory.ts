'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Warehouses
export async function getWarehouses() {
  try {
    return await prisma.warehouse.findMany({
      orderBy: { priority: 'desc' },
      include: {
        _count: {
          select: { inventory: true }
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch warehouses:', error)
    throw new Error('Failed to fetch warehouses')
  }
}

export async function createWarehouse(data: { name: string; location?: string; priority?: number; isActive?: boolean }) {
  try {
    const warehouse = await prisma.warehouse.create({ data })
    try {
      revalidatePath('/admin/inventory/warehouses')
    } catch {
      // Ignore revalidatePath errors in non-request contexts
    }
    return warehouse
  } catch (error) {
    console.error('Failed to create warehouse:', error)
    throw new Error('Failed to create warehouse')
  }
}

export async function updateWarehouse(id: string, data: { name?: string; location?: string; priority?: number; isActive?: boolean }) {
  try {
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data
    })
    try {
      revalidatePath('/admin/inventory/warehouses')
    } catch {
      // Ignore revalidatePath errors in non-request contexts
    }
    return warehouse
  } catch (error) {
    console.error('Failed to update warehouse:', error)
    throw new Error('Failed to update warehouse')
  }
}

export async function deleteWarehouse(id: string) {
  try {
    await prisma.warehouse.delete({ where: { id } })
    try {
      revalidatePath('/admin/inventory/warehouses')
    } catch {
      // Ignore revalidatePath errors in non-request contexts
    }
  } catch (error) {
    console.error('Failed to delete warehouse:', error)
    throw new Error('Failed to delete warehouse')
  }
}

export async function getWarehouse(id: string) {
  try {
    return await prisma.warehouse.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { product: true }
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch warehouse:', error)
    throw new Error('Failed to fetch warehouse')
  }
}

// Inventory
export async function getInventory(productId?: string) {
  try {
    if (productId) {
      return await prisma.inventory.findMany({
        where: { productId },
        include: { warehouse: true, product: true }
      })
    }
    return await prisma.inventory.findMany({
      include: { warehouse: true, product: true }
    })
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    throw new Error('Failed to fetch inventory')
  }
}

export async function adjustInventory(warehouseId: string, productId: string, delta: number) {
  try {
    // Transaction to update inventory and sync product total
    await prisma.$transaction(async (tx) => {
      await tx.inventory.upsert({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId
          }
        },
        create: {
          warehouseId,
          productId,
          quantity: delta
        },
        update: {
          quantity: { increment: delta }
        }
      })

      // Update product cached total
      const totalInventory = await tx.inventory.aggregate({
        where: { productId },
        _sum: { quantity: true }
      })

      await tx.product.update({
        where: { id: productId },
        data: {
          inventoryCount: totalInventory._sum.quantity || 0
        }
      })
    })

    try {
      revalidatePath('/admin/inventory')
      revalidatePath(`/admin/inventory/warehouses/${warehouseId}`)
    } catch {
      // Ignore revalidatePath errors in non-request contexts
    }
  } catch (error) {
    console.error('Failed to adjust inventory:', error)
    throw new Error('Failed to adjust inventory')
  }
}

// Transfers
export async function getTransfers() {
  try {
    return await prisma.inventoryTransfer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        product: true
      }
    })
  } catch (error) {
    console.error('Failed to fetch transfers:', error)
    throw new Error('Failed to fetch transfers')
  }
}

export async function createTransfer(data: { fromWarehouseId: string; toWarehouseId: string; productId: string; quantity: number; notes?: string }) {
  try {
    const transfer = await prisma.inventoryTransfer.create({
      data: {
        ...data,
        status: 'PENDING'
      }
    })
    try {
      revalidatePath('/admin/inventory/transfers')
    } catch {
      // Ignore revalidatePath errors in non-request contexts
    }
    return transfer
  } catch (error) {
    console.error('Failed to create transfer:', error)
    throw new Error('Failed to create transfer')
  }
}

export async function processTransfer(id: string, action: 'COMPLETED' | 'CANCELLED') {
  try {
    const transfer = await prisma.inventoryTransfer.findUnique({
      where: { id }
    })

    if (!transfer) throw new Error('Transfer not found')
    if (transfer.status !== 'PENDING') throw new Error('Transfer is not pending')

    await prisma.$transaction(async (tx) => {
      if (action === 'COMPLETED') {
        // Decrement from source
        await tx.inventory.update({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.fromWarehouseId,
              productId: transfer.productId
            }
          },
          data: {
            quantity: { decrement: transfer.quantity }
          }
        })

        // Increment to destination
        await tx.inventory.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.toWarehouseId,
              productId: transfer.productId
            }
          },
          create: {
            warehouseId: transfer.toWarehouseId,
            productId: transfer.productId,
            quantity: transfer.quantity
          },
          update: {
            quantity: { increment: transfer.quantity }
          }
        })
      }

      await tx.inventoryTransfer.update({
        where: { id },
        data: {
          status: action,
          completedAt: action === 'COMPLETED' ? new Date() : null
        }
      })
    })

    try {
      revalidatePath('/admin/inventory/transfers')
    } catch {
      // Ignore revalidatePath errors in non-request contexts
    }
  } catch (error) {
    console.error('Failed to process transfer:', error)
    throw new Error('Failed to process transfer')
  }
}
