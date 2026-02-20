import prisma from '@/lib/prisma'

export interface AllocationResult {
  allocations: {
    productId: string
    quantity: number
    warehouseId: string
  }[]
  unfulfilled: {
    productId: string
    quantity: number
  }[]
}

export async function allocateOrder(items: { productId: string, quantity: number }[]): Promise<AllocationResult> {
  const result: AllocationResult = {
    allocations: [],
    unfulfilled: []
  }

  for (const item of items) {
    let remainingQuantity = item.quantity

    // Find warehouses with stock for this product
    // We prioritize warehouses with the most stock to consolidate shipments if possible
    // In a real system, we'd also consider location (distance to customer)
    const inventory = await prisma.inventory.findMany({
      where: {
        productId: item.productId,
        quantity: { gt: 0 }
      },
      include: {
        warehouse: true
      },
      orderBy: {
        quantity: 'desc'
      }
    })

    for (const inv of inventory) {
      if (remainingQuantity <= 0) break

      const available = inv.quantity - inv.reserved
      if (available <= 0) continue

      const allocate = Math.min(available, remainingQuantity)

      result.allocations.push({
        productId: item.productId,
        quantity: allocate,
        warehouseId: inv.warehouseId
      })

      remainingQuantity -= allocate
    }

    if (remainingQuantity > 0) {
      result.unfulfilled.push({
        productId: item.productId,
        quantity: remainingQuantity
      })
    }
  }

  return result
}
