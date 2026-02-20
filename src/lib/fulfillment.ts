import prisma from '@/lib/prisma'

export type AllocationResult = {
  warehouseId: string
  items: { productId: string; quantity: number }[]
}

export async function allocateStock(items: { productId: string; quantity: number }[]): Promise<AllocationResult[]> {
  const warehouses = await prisma.warehouse.findMany({
    where: { isEnabled: true },
    orderBy: { priority: 'desc' },
    include: { inventory: true },
  })

  if (warehouses.length === 0) {
    throw new Error('No active warehouses found')
  }

  const result: AllocationResult[] = []

  // Track remaining needed quantity for each product
  const remainingNeeds = new Map<string, number>()
  for (const item of items) {
    const current = remainingNeeds.get(item.productId) || 0
    remainingNeeds.set(item.productId, current + item.quantity)
  }

  // Iterate warehouses by priority
  for (const warehouse of warehouses) {
    const warehouseItems: { productId: string; quantity: number }[] = []

    for (const [productId, quantityNeeded] of remainingNeeds.entries()) {
      if (quantityNeeded <= 0) continue

      const inventory = warehouse.inventory.find(i => i.productId === productId)
      if (inventory && inventory.quantity > 0) {
        const take = Math.min(inventory.quantity, quantityNeeded)
        warehouseItems.push({ productId, quantity: take })
        remainingNeeds.set(productId, quantityNeeded - take)
      }
    }

    if (warehouseItems.length > 0) {
      result.push({
        warehouseId: warehouse.id,
        items: warehouseItems
      })
    }

    // Check if all fulfilled
    const allFulfilled = Array.from(remainingNeeds.values()).every(q => q <= 0)
    if (allFulfilled) break
  }

  // Check if anything is unfulfilled
  const unfulfilled = Array.from(remainingNeeds.entries()).filter(([_, q]) => q > 0)
  if (unfulfilled.length > 0) {
    // In a real system, we might return partial allocation or throw error.
    // For now, let's throw error.
    const productIds = unfulfilled.map(u => u[0])
    throw new Error(`Insufficient stock for products: ${productIds.join(', ')}`)
  }

  return result
}
