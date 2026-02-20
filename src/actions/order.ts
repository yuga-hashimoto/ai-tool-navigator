'use server'

import prisma from '@/lib/prisma'
import { allocateOrder } from '@/lib/fulfillment'

export async function submitOrder(data: {
  sessionId: string
  total: number
  items: { slug: string, quantity: number, price: number }[]
}) {
    // 1. Resolve product slugs to IDs
    const slugs = data.items.map(i => i.slug)
    const products = await prisma.product.findMany({
        where: { slug: { in: slugs } }
    })

    const productMap = new Map(products.map(p => [p.slug, p]))

    const orderInputs = []
    for (const item of data.items) {
        const product = productMap.get(item.slug)
        if (product) {
            orderInputs.push({
                productId: product.id,
                quantity: item.quantity,
                price: item.price
            })
        }
    }

    if (orderInputs.length === 0) {
        throw new Error('No valid products found')
    }

    // 2. Allocate Order
    const allocation = await allocateOrder(orderInputs.map(i => ({ productId: i.productId, quantity: i.quantity })))

    // 3. Create Order and Transactions
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                sessionId: data.sessionId,
                total: data.total,
                status: 'PAID'
            }
        })

        // 1. Allocated items
        for (const alloc of allocation.allocations) {
            const originalItem = orderInputs.find(i => i.productId === alloc.productId)
            if (originalItem) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: alloc.productId,
                        quantity: alloc.quantity,
                        price: originalItem.price,
                        warehouseId: alloc.warehouseId
                    }
                })

                // Update Inventory
                await tx.inventory.update({
                    where: {
                        warehouseId_productId: {
                            warehouseId: alloc.warehouseId,
                            productId: alloc.productId
                        }
                    },
                    data: {
                        quantity: { decrement: alloc.quantity }
                    }
                })
            }
        }

        // 2. Unfulfilled items
        for (const unfulfilled of allocation.unfulfilled) {
            const originalItem = orderInputs.find(i => i.productId === unfulfilled.productId)
             if (originalItem) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: unfulfilled.productId,
                        quantity: unfulfilled.quantity,
                        price: originalItem.price,
                        warehouseId: null // No warehouse assigned
                    }
                })
             }
        }

        return order
    })
}
