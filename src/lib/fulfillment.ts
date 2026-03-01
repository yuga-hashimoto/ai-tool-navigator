import prisma from '@/lib/prisma';

export interface AllocationPlan {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export async function createAllocationPlan(items: { productId: string; quantity: number }[]): Promise<AllocationPlan[]> {
  const plans: AllocationPlan[] = [];

  // Fetch all active warehouses sorted by priority
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
    include: {
      inventory: true
    }
  });

  if (warehouses.length === 0) {
    throw new Error("No active warehouses found");
  }

  // Fetch product details for backorder check
  const productIds = items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  // We need to keep track of available stock during this calculation
  // Create a map of warehouseId -> (productId -> quantity)
  const tempInventory = new Map<string, Map<string, number>>();

  for (const w of warehouses) {
    const invMap = new Map<string, number>();
    for (const inv of w.inventory) {
      invMap.set(inv.productId, inv.quantity);
    }
    tempInventory.set(w.id, invMap);
  }

  for (const item of items) {
    let quantityNeeded = item.quantity;
    let allocated = false;
    const product = productMap.get(item.productId);

    if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
    }

    // Strategy 1: Try to find a single warehouse first (optimization to avoid splitting shipments)
    for (const warehouse of warehouses) {
      const warehouseStock = tempInventory.get(warehouse.id)?.get(item.productId) || 0;
      if (warehouseStock >= quantityNeeded) {
        plans.push({
          productId: item.productId,
          warehouseId: warehouse.id,
          quantity: quantityNeeded
        });

        // Update temp inventory
        tempInventory.get(warehouse.id)!.set(item.productId, warehouseStock - quantityNeeded);
        allocated = true;
        break;
      }
    }

    if (!allocated) {
      // Strategy 2: Split across multiple warehouses
      for (const warehouse of warehouses) {
        if (quantityNeeded <= 0) break;

        const warehouseStock = tempInventory.get(warehouse.id)?.get(item.productId) || 0;

        if (warehouseStock > 0) {
            const take = Math.min(warehouseStock, quantityNeeded);
            plans.push({
                productId: item.productId,
                warehouseId: warehouse.id,
                quantity: take
            });
            // Update temp inventory
            tempInventory.get(warehouse.id)!.set(item.productId, warehouseStock - take);
            quantityNeeded -= take;
        }
      }

      // If still needed, check backorder
      if (quantityNeeded > 0) {
         if (product.allowBackorder) {
             // Assign to highest priority warehouse
             const mainWarehouse = warehouses[0];
             plans.push({
                 productId: item.productId,
                 warehouseId: mainWarehouse.id,
                 quantity: quantityNeeded
             });
         } else {
             throw new Error(`Insufficient stock for product ${product.name} (ID: ${product.id})`);
         }
      }
    }
  }

  return plans;
}
