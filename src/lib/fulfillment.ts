import prisma from '@/lib/prisma'

type OrderItem = {
  productId: string
  quantity: number
}

type Allocation = {
  warehouseId: string
  items: {
    productId: string
    quantity: number
  }[]
}

export async function allocateOrder(items: OrderItem[]): Promise<Allocation[]> {
  const allocations: Allocation[] = []

  // Fetch active warehouses ordered by priority
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
    include: {
      inventory: {
        where: {
          productId: { in: items.map(i => i.productId) },
          quantity: { gt: 0 }
        }
      }
    }
  })

  // Group inventory by product for easier access
  // structure: productId -> [{ warehouseId, quantity }, ...] (already sorted by warehouse priority)
  const inventoryByProduct: Record<string, { warehouseId: string, quantity: number }[]> = {}

  for (const warehouse of warehouses) {
    for (const inv of warehouse.inventory) {
      if (!inventoryByProduct[inv.productId]) {
        inventoryByProduct[inv.productId] = []
      }
      inventoryByProduct[inv.productId].push({
        warehouseId: warehouse.id,
        quantity: inv.quantity
      })
    }
  }

  // Allocate items
  for (const item of items) {
    let remaining = item.quantity
    const sources = inventoryByProduct[item.productId] || []

    // Iterate through sources (highest priority warehouse first)
    for (const source of sources) {
      if (remaining <= 0) break

      const take = Math.min(remaining, source.quantity)
      if (take > 0) {
        // Find or create allocation for this warehouse
        let allocation = allocations.find(a => a.warehouseId === source.warehouseId)
        if (!allocation) {
          allocation = { warehouseId: source.warehouseId, items: [] }
          allocations.push(allocation)
        }

        allocation.items.push({ productId: item.productId, quantity: take })

        // Update local tracking to prevent over-allocation if multiple items use same product (unlikely here but good practice)
        source.quantity -= take
        remaining -= take
      }
    }

    if (remaining > 0) {
      console.warn(`Could not fully allocate product ${item.productId}. Missing: ${remaining}`)
      // Backorder logic would go here
    }
  }

  return allocations
}
