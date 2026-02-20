import { PrismaClient } from '@prisma/client'
import { submitOrder } from '../src/actions/order'
import { createWarehouse, adjustInventory, transferInventory } from '../src/actions/inventory'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Verification ---')

  // 1. Create Product
  console.log('Creating Test Product...')
  const productSlug = `test-product-${Date.now()}`
  const product = await prisma.product.create({
    data: {
      name: 'Test Product',
      slug: productSlug,
      description: 'A test product for inventory',
      price: '$100',
    }
  })
  console.log('Product Created:', product.id)

  // 2. Create Warehouses
  console.log('Creating Warehouses...')
  const wh1 = await createWarehouse({
    name: 'Warehouse 1',
    location: 'Location 1',
    type: 'PHYSICAL'
  })
  const wh2 = await createWarehouse({
    name: 'Warehouse 2',
    location: 'Location 2',
    type: 'PHYSICAL'
  })
  console.log('Warehouses Created:', wh1.id, wh2.id)

  // 3. Add Stock
  console.log('Adding Stock...')
  await adjustInventory({
    warehouseId: wh1.id,
    productId: product.id,
    quantity: 10
  })
  await adjustInventory({
    warehouseId: wh2.id,
    productId: product.id,
    quantity: 5
  })

  // Verify stock
  const inv1 = await prisma.inventory.findUnique({
    where: { warehouseId_productId: { warehouseId: wh1.id, productId: product.id } }
  })
  console.log('Warehouse 1 Stock:', inv1?.quantity) // Should be 10

  // 4. Submit Order (Should be fulfilled by Warehouse 1 - larger stock)
  console.log('Submitting Order (Qty: 8)...')
  const order = await submitOrder({
    sessionId: 'test-session',
    total: 800,
    items: [{ slug: productSlug, quantity: 8, price: 100 }]
  })
  console.log('Order Created:', order.id)

  // Check Order Items
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id }
  })
  console.log('Order Items:', orderItems)
  if (orderItems[0].warehouseId === wh1.id) {
    console.log('SUCCESS: Order fulfilled by Warehouse 1')
  } else {
    console.log('FAILURE: Order NOT fulfilled by Warehouse 1')
  }

  // Check Stock Deductions
  const inv1After = await prisma.inventory.findUnique({
    where: { warehouseId_productId: { warehouseId: wh1.id, productId: product.id } }
  })
  console.log('Warehouse 1 Stock After:', inv1After?.quantity) // Should be 2

  // 5. Submit Order split across warehouses
  // Remaining: WH1: 2, WH2: 5. Total 7.
  // Order 4. Should take 2 from WH1 (if prioritized?) or 4 from WH2 (if "most stock" logic works).
  // allocateOrder sorts by quantity desc. WH2 (5) > WH1 (2).
  // So WH2 should fulfill it.

  console.log('Submitting Order (Qty: 4)...')
  const order2 = await submitOrder({
    sessionId: 'test-session-2',
    total: 400,
    items: [{ slug: productSlug, quantity: 4, price: 100 }]
  })

  const orderItems2 = await prisma.orderItem.findMany({
    where: { orderId: order2.id }
  })
  console.log('Order 2 Items:', orderItems2)
   if (orderItems2[0].warehouseId === wh2.id) {
    console.log('SUCCESS: Order 2 fulfilled by Warehouse 2')
  } else {
    console.log('FAILURE: Order 2 fulfilled by', orderItems2[0].warehouseId)
  }

  // 6. Test Transfer
  console.log('Testing Transfer...')
  const transfer = await transferInventory({
      fromWarehouseId: wh2.id,
      toWarehouseId: wh1.id,
      productId: product.id,
      quantity: 1
  })
  console.log('Transfer Created:', transfer.id)

  console.log('--- Verification Complete ---')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
