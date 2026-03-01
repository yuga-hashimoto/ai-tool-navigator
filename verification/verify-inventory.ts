import { PrismaClient } from '@prisma/client';
import { createOrder } from '../src/actions/order';
import { createWarehouse, updateInventory, deleteWarehouse } from '../src/actions/inventory';
import { createAllocationPlan } from '../src/lib/fulfillment';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Inventory Verification...');

  const runId = Math.floor(Math.random() * 10000);

  // 1. Create Product
  const productSlug = `test-product-${runId}`;
  const product = await prisma.product.create({
    data: {
      name: `Test Product ${runId}`,
      slug: productSlug,
      price: "$10.00",
      allowBackorder: true
    }
  });
  console.log(`Created Product: ${product.slug} (${product.id})`);

  let w1, w2;

  try {

  // 2. Create Warehouses
  const w1Res = await createWarehouse({
    name: `W1-${runId}`,
    location: 'US',
    priority: 10
  });
  if (!w1Res.success || !w1Res.warehouse) throw new Error('Failed to create W1');
  w1 = w1Res.warehouse;
  console.log(`Created Warehouse W1 (Priority 10): ${w1.id}`);

  const w2Res = await createWarehouse({
    name: `W2-${runId}`,
    location: 'EU',
    priority: 5
  });
  if (!w2Res.success || !w2Res.warehouse) throw new Error('Failed to create W2');
  w2 = w2Res.warehouse;
  console.log(`Created Warehouse W2 (Priority 5): ${w2.id}`);

  // 3. Add Stock
  // W1: 5
  await updateInventory(w1.id, product.id, 5);
  console.log('Added 5 stock to W1');

  // W2: 10
  await updateInventory(w2.id, product.id, 10);
  console.log('Added 10 stock to W2');

  // 4. Test Allocation Logic (Simulation)
  console.log('\n--- Test 1: Order 4 items ---');
  // Should take from W1
  const plan1 = await createAllocationPlan([{ productId: product.id, quantity: 4 }]);
  console.log('Plan 1:', plan1);
  if (plan1.length !== 1 || plan1[0].warehouseId !== w1.id || plan1[0].quantity !== 4) {
      throw new Error('Test 1 Failed: Expected 4 from W1');
  }

  // 5. Execute Order 1 via createOrder
  const order1Res = await createOrder({
      cart: [{ slug: product.slug, quantity: 4 }],
      paymentDetails: {},
      sessionId: 'test-session'
  });
  if (!order1Res.success) throw new Error(`Order 1 Failed: ${order1Res.error}`);
  console.log(`Order 1 Created: ${order1Res.orderId}`);

  // Check Inventory
  const w1Inv1 = await prisma.inventory.findUnique({ where: { warehouseId_productId: { warehouseId: w1.id, productId: product.id }}});
  console.log(`W1 Inventory after Order 1: ${w1Inv1?.quantity} (Expected 1)`);
  if (w1Inv1?.quantity !== 1) throw new Error('Test 1 Inventory Check Failed');


  // 6. Test 2: Order 6 items
  // Should take 6 from W2 because W2 has enough stock and Strategy 1 prefers single shipment.
  // W1 has 1, W2 has 10. W1 cannot fulfill. W2 can.
  console.log('\n--- Test 2: Order 6 items ---');
  const order2Res = await createOrder({
      cart: [{ slug: product.slug, quantity: 6 }],
      paymentDetails: {},
      sessionId: 'test-session'
  });
  if (!order2Res.success) throw new Error(`Order 2 Failed: ${order2Res.error}`);
  console.log(`Order 2 Created: ${order2Res.orderId}`);

  const w1Inv2 = await prisma.inventory.findUnique({ where: { warehouseId_productId: { warehouseId: w1.id, productId: product.id }}});
  const w2Inv2 = await prisma.inventory.findUnique({ where: { warehouseId_productId: { warehouseId: w2.id, productId: product.id }}});

  console.log(`W1 Inventory after Order 2: ${w1Inv2?.quantity} (Expected 1)`);
  console.log(`W2 Inventory after Order 2: ${w2Inv2?.quantity} (Expected 4)`);

  if (w1Inv2?.quantity !== 1 || w2Inv2?.quantity !== 4) throw new Error('Test 2 Inventory Check Failed');


  // 7. Test 3: Order 6 items (Backorder)
  // State: W1: 1, W2: 4. Need 6.
  // Strategy 1 fails.
  // Strategy 2: W1 takes 1. W2 takes 4. Remaining 1.
  // Backorder: Assign to W1 (highest priority). W1 takes 1 more.
  // Total W1 use: 2. W2 use: 4.
  // Final: W1: 1 - 2 = -1. W2: 4 - 4 = 0.
  console.log('\n--- Test 3: Order 6 items (Backorder) ---');

  // Debug: Check plan
  const plan3 = await createAllocationPlan([{ productId: product.id, quantity: 6 }]);
  console.log('Plan 3:', JSON.stringify(plan3, null, 2));

  const order3Res = await createOrder({
      cart: [{ slug: product.slug, quantity: 6 }],
      paymentDetails: {},
      sessionId: 'test-session'
  });
  if (!order3Res.success) throw new Error(`Order 3 Failed: ${order3Res.error}`);
  console.log(`Order 3 Created: ${order3Res.orderId}`);

  const w1Inv3 = await prisma.inventory.findUnique({ where: { warehouseId_productId: { warehouseId: w1.id, productId: product.id }}});
  const w2Inv3 = await prisma.inventory.findUnique({ where: { warehouseId_productId: { warehouseId: w2.id, productId: product.id }}});

  console.log(`W1 Inventory after Order 3: ${w1Inv3?.quantity} (Expected -1)`);
  console.log(`W2 Inventory after Order 3: ${w2Inv3?.quantity} (Expected 0)`);

  if (w1Inv3?.quantity !== -1 || w2Inv3?.quantity !== 0) throw new Error('Test 3 Inventory Check Failed');

  console.log('\nverification PASSED');

  } finally {
      // Cleanup
      console.log('Cleaning up...');
      try {
          await prisma.orderItem.deleteMany({ where: { productId: product.id } });
          await prisma.inventory.deleteMany({ where: { productId: product.id } });
          await prisma.inventoryTransfer.deleteMany({ where: { productId: product.id } });
          await prisma.product.delete({ where: { id: product.id } });

          if (w1) await deleteWarehouse(w1.id);
          if (w2) await deleteWarehouse(w2.id);

          console.log('Cleanup complete');
      } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
      }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
