import prisma from '@/lib/prisma';

export interface AllocationItem {
  productId: string;
  quantity: number;
}

export interface AllocationResult {
  allocations: {
    productId: string;
    warehouseId: string;
    quantity: number;
  }[];
  orderType: 'STANDARD' | 'BACKORDER' | 'PRE_ORDER';
  success: boolean;
  errors?: string[];
}

export async function allocateOrder(items: AllocationItem[]): Promise<AllocationResult> {
  const allocations: { productId: string; warehouseId: string; quantity: number }[] = [];
  let orderType: AllocationResult['orderType'] = 'STANDARD';
  const errors: string[] = [];

  // Aggregate quantities by product ID
  const aggregatedItems = items.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  for (const [productId, quantity] of Object.entries(aggregatedItems)) {
    let remainingQuantity = quantity;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      errors.push(`Product not found: ${productId}`);
      continue;
    }

    // Determine if it's a pre-order based on release date
    if (product.preOrderReleaseDate && new Date(product.preOrderReleaseDate) > new Date()) {
      orderType = 'PRE_ORDER';
    }

    // Get active warehouses with stock, sorted by priority
    const warehouses = product.inventory
      .filter(inv => inv.warehouse.isActive)
      .sort((a, b) => b.warehouse.priority - a.warehouse.priority);

    // First pass: Allocate from available stock
    for (const inv of warehouses) {
      if (remainingQuantity <= 0) break;

      const available = inv.quantity;
      if (available > 0) {
        const allocateAmount = Math.min(remainingQuantity, available);
        allocations.push({
          productId,
          warehouseId: inv.warehouseId,
          quantity: allocateAmount,
        });
        remainingQuantity -= allocateAmount;
      }
    }

    // Second pass: If still remaining, handle based on backorder/preorder rules
    if (remainingQuantity > 0) {
      if (orderType === 'PRE_ORDER' || product.allowBackorder) {
        if (orderType !== 'PRE_ORDER') {
            orderType = 'BACKORDER';
        }

        // Find the best warehouse to assign the deficit
        // Try to assign to the highest priority active warehouse
        let targetWarehouseId: string | undefined = warehouses[0]?.warehouseId;

        if (!targetWarehouseId) {
            const fallbackWarehouse = await prisma.warehouse.findFirst({
                where: { isActive: true },
                orderBy: { priority: 'desc' }
            });
            targetWarehouseId = fallbackWarehouse?.id;
        }

        if (targetWarehouseId) {
          // Check if we already have an allocation for this warehouse
          const existingAlloc = allocations.find(a => a.productId === productId && a.warehouseId === targetWarehouseId);
          if (existingAlloc) {
            existingAlloc.quantity += remainingQuantity;
          } else {
            allocations.push({
              productId,
              warehouseId: targetWarehouseId,
              quantity: remainingQuantity,
            });
          }
          remainingQuantity = 0;
        } else {
          errors.push(`No active warehouse available to accept backorder/preorder for: ${product.name}`);
        }
      } else {
        errors.push(`Insufficient stock for product: ${product.name}`);
      }
    }
  }

  if (errors.length > 0) {
    return {
      allocations: [],
      orderType: 'STANDARD',
      success: false,
      errors,
    };
  }

  return {
    allocations,
    orderType,
    success: true,
  };
}
