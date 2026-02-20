'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createWarehouse(data: {
  name: string
  location: string
  type: string
  isActive?: boolean
}) {
  const warehouse = await prisma.warehouse.create({
    data,
  })
  try { revalidatePath('/admin/inventory') } catch {}
  return warehouse
}

export async function updateWarehouse(id: string, data: {
  name?: string
  location?: string
  type?: string
  isActive?: boolean
}) {
  const warehouse = await prisma.warehouse.update({
    where: { id },
    data,
  })
  try { revalidatePath('/admin/inventory') } catch {}
  return warehouse
}

export async function getWarehouses() {
  return prisma.warehouse.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { inventory: true }
      }
    }
  })
}

export async function getWarehouse(id: string) {
    return prisma.warehouse.findUnique({
        where: { id },
        include: {
            inventory: {
                include: {
                    product: true
                }
            }
        }
    })
}

export async function adjustInventory(data: {
  warehouseId: string
  productId: string
  quantity: number
}) {
    // Check if inventory record exists
    const existing = await prisma.inventory.findUnique({
        where: {
            warehouseId_productId: {
                warehouseId: data.warehouseId,
                productId: data.productId
            }
        }
    })

    let inventory;
    if (existing) {
        inventory = await prisma.inventory.update({
            where: {
                warehouseId_productId: {
                    warehouseId: data.warehouseId,
                    productId: data.productId
                }
            },
            data: {
                quantity: data.quantity
            }
        })
    } else {
        inventory = await prisma.inventory.create({
            data: {
                warehouseId: data.warehouseId,
                productId: data.productId,
                quantity: data.quantity
            }
        })
    }

    try { revalidatePath('/admin/inventory') } catch {}
    return inventory
}

export async function transferInventory(data: {
  fromWarehouseId: string
  toWarehouseId: string
  productId: string
  quantity: number
}) {
    // 1. Create transfer record
    const transfer = await prisma.inventoryTransfer.create({
        data: {
            fromWarehouseId: data.fromWarehouseId,
            toWarehouseId: data.toWarehouseId,
            productId: data.productId,
            quantity: data.quantity,
            status: 'PENDING'
        }
    })

    try { revalidatePath('/admin/inventory/transfers') } catch {}
    return transfer
}

export async function completeTransfer(transferId: string) {
    // Transaction to move stock
    return prisma.$transaction(async (tx) => {
        const transfer = await tx.inventoryTransfer.findUnique({
            where: { id: transferId }
        })

        if (!transfer || transfer.status !== 'PENDING') {
            throw new Error('Invalid transfer')
        }

        // Check if source has enough stock
        const sourceInventory = await tx.inventory.findUnique({
            where: {
                warehouseId_productId: {
                    warehouseId: transfer.fromWarehouseId,
                    productId: transfer.productId
                }
            }
        })

        if (!sourceInventory || sourceInventory.quantity < transfer.quantity) {
             throw new Error('Insufficient stock in source warehouse')
        }

        // Decrement source
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

        // Increment dest
        await tx.inventory.upsert({
            where: {
                warehouseId_productId: {
                    warehouseId: transfer.toWarehouseId,
                    productId: transfer.productId
                }
            },
            update: {
                quantity: { increment: transfer.quantity }
            },
            create: {
                warehouseId: transfer.toWarehouseId,
                productId: transfer.productId,
                quantity: transfer.quantity
            }
        })

        // Update transfer status
        const completed = await tx.inventoryTransfer.update({
            where: { id: transferId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        })

        try { revalidatePath('/admin/inventory/transfers') } catch {}
        return completed
    })
}

export async function getTransfers() {
    return prisma.inventoryTransfer.findMany({
        orderBy: { requestedAt: 'desc' },
        include: {
            product: true,
            fromWarehouse: true,
            toWarehouse: true
        }
    })
}
