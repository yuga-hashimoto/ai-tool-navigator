import { PrismaClient } from '@prisma/client';
import { addWarehouse, updateInventory, createTransfer, completeTransfer, getWarehouses } from '@/actions/inventory';
import { allocateOrder } from '@/lib/fulfillment';
import { submitOrder } from '@/actions/order';

// Mock prisma if needed or use real one
// Since I can't easily mock in this environment, I'll rely on the actual DB.
// I'll set DATABASE_URL to a temp file if not present.

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./verify_test.db';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up test data...');

  // Clean up
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventoryTransfer.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.product.deleteMany({
      where: { slug: { in: ['test-product', 'order-product'] } }
    });
  } catch (e) {
    console.log('Cleanup failed:', e);
  }

  // Create Product
  const product = await prisma.product.create({
    data: {
      slug: 'test-product',
      name: 'Test Product',
      price: '10.00',
      inventoryCount: 0,
    }
  });

  // Create Warehouses
  const w1 = await addWarehouse({ name: 'Warehouse A', location: 'Loc A', priority: 10 });
  const w2 = await addWarehouse({ name: 'Warehouse B', location: 'Loc B', priority: 5 });

  if (!w1.success || !w2.success) {
    throw new Error('Failed to create warehouses');
  }

  const warehouseA = w1.data!;
  const warehouseB = w2.data!;

  console.log('Warehouses created:', warehouseA.name, warehouseB.name);

  // Add Inventory
  await updateInventory(product.id, warehouseA.id, 10);
  await updateInventory(product.id, warehouseB.id, 5);

  console.log('Inventory added');

  // Test Allocation (Standard)
  console.log('Testing Allocation (Standard)...');
  const alloc1 = await allocateOrder([{ productId: product.id, quantity: 8 }]);
  console.log('Alloc 1:', alloc1);
  // Expect: 8 from Warehouse A (priority 10)

  if (alloc1.allocations[0].warehouseId !== warehouseA.id || alloc1.allocations[0].quantity !== 8) {
    throw new Error('Allocation 1 failed');
  }

  // Test Allocation (Split)
  console.log('Testing Allocation (Split)...');
  // Warehouse A has 10, used 0 (because allocateOrder is read-only simulation without commit).
  // allocateOrder calculates based on DB state. DB state is 10 in A, 5 in B.
  const alloc2 = await allocateOrder([{ productId: product.id, quantity: 12 }]);
  console.log('Alloc 2:', alloc2);
  // Expect: 10 from A, 2 from B.

  const allocA = alloc2.allocations.find(a => a.warehouseId === warehouseA.id);
  const allocB = alloc2.allocations.find(a => a.warehouseId === warehouseB.id);

  if (allocA?.quantity !== 10 || allocB?.quantity !== 2) {
    throw new Error('Allocation 2 failed');
  }

  // Test Transfer
  console.log('Testing Transfer...');
  const transfer = await createTransfer({
    productId: product.id,
    sourceWarehouseId: warehouseA.id,
    targetWarehouseId: warehouseB.id,
    quantity: 3
  });

  if (!transfer.success) throw new Error('Transfer failed');

  // Check inventory after transfer creation (source should decrement)
  const invA = await prisma.inventory.findUnique({
    where: { productId_warehouseId: { productId: product.id, warehouseId: warehouseA.id } }
  });
  if (invA?.quantity !== 7) throw new Error('Source inventory not decremented');

  await completeTransfer(transfer.data!.id);

  const invB = await prisma.inventory.findUnique({
    where: { productId_warehouseId: { productId: product.id, warehouseId: warehouseB.id } }
  });
  if (invB?.quantity !== 8) throw new Error('Target inventory not incremented'); // 5 + 3

  // Test Order Submission
  console.log('Testing Order Submission...');

  // Create another product for order test
  const product2 = await prisma.product.create({
    data: {
      slug: 'order-product',
      name: 'Order Product',
      price: '20.00',
      inventoryCount: 0,
    }
  });

  await updateInventory(product2.id, warehouseA.id, 5);

  const orderRes = await submitOrder({
    sessionId: 'test-session',
    userId: 'test-user',
    items: [
        { slug: 'order-product', quantity: 2, price: 20 }
    ],
    total: 40
  });

  if (!orderRes.success) {
    throw new Error('Order submission failed: ' + orderRes.error);
  }

  console.log('Order created:', orderRes.data.id);

  // Check inventory after order
  const invAfterOrder = await prisma.inventory.findUnique({
    where: { productId_warehouseId: { productId: product2.id, warehouseId: warehouseA.id } }
  });

  if (invAfterOrder?.quantity !== 3) { // 5 - 2
    throw new Error('Inventory not deducted after order');
  }

  console.log('Verification successful!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
