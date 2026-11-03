import { describe, expect, it } from 'vitest'
import {
  createOrder,
  getOrderById,
  getOrderUpdates,
  getOrders,
  updateOrderStatus
} from './order.service'
import { getProducts } from './product.service'
import { must, useTempDataFile } from '../test-utils'
import { writeData } from '../utils/storage'

useTempDataFile()

describe('createOrder', () => {
  it('computes the total from current server-side prices and snapshots item data', async () => {
    const products = await getProducts()
    const productA = must(products[0])
    const productB = must(products[1])

    const order = await createOrder({
      items: [
        { productId: productA.id, quantity: 2 },
        { productId: productB.id, quantity: 1 }
      ]
    })

    expect(order.status).toBe('new')
    expect(order.orderNumber).toMatch(/^ORD-\d{6}$/)
    expect(order.totalAmount).toBe(productA.price * 2 + productB.price * 1)
    expect(order.items[0]).toMatchObject({
      productId: productA.id,
      unitPrice: productA.price,
      quantity: 2,
      subtotal: productA.price * 2
    })
  })

  it('ignores any client-sent price or total and never trusts it', async () => {
    const product = must((await getProducts())[0])

    // The request schema has no price/total fields, but simulate a client
    // trying to smuggle them in via an unknown property.
    const order = await createOrder({
      items: [{ productId: product.id, quantity: 1 }]
    } as Parameters<typeof createOrder>[0])

    expect(order.totalAmount).toBe(product.price)
  })

  it('rejects an order referencing a product that does not exist', async () => {
    await expect(
      createOrder({ items: [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }] })
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('rejects an order referencing an inactive product', async () => {
    const product = must((await getProducts())[0])
    await writeData((current) => ({
      ...current,
      products: current.products.map((p) => (p.id === product.id ? { ...p, isActive: false } : p))
    }))

    await expect(
      createOrder({ items: [{ productId: product.id, quantity: 1 }] })
    ).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('keeps the original price snapshot even if the product price changes later', async () => {
    const product = must((await getProducts())[0])
    const order = await createOrder({ items: [{ productId: product.id, quantity: 1 }] })

    await writeData((current) => ({
      ...current,
      products: current.products.map((p) =>
        p.id === product.id ? { ...p, price: p.price + 99999 } : p
      )
    }))

    const reloaded = await getOrderById(order.id)
    expect(reloaded.items[0]?.unitPrice).toBe(product.price)
    expect(reloaded.totalAmount).toBe(product.price)
  })
})

describe('getOrders', () => {
  it('filters by status and sorts by creation time', async () => {
    const product = must((await getProducts())[0])
    const first = await createOrder({ items: [{ productId: product.id, quantity: 1 }] })
    // Guarantee a distinct createdAt so sort order is deterministic, even on
    // a fast machine where both could otherwise land in the same ms.
    await new Promise((resolve) => setTimeout(resolve, 5))
    const second = await createOrder({ items: [{ productId: product.id, quantity: 1 }] })
    await updateOrderStatus(second.id, 'preparing')

    const newOrders = await getOrders({ status: 'new' })
    expect(newOrders.map((order) => order.id)).toEqual([first.id])

    const allDescending = await getOrders({ sort: 'desc' })
    expect(allDescending[0]?.id).toBe(second.id)
  })
})

describe('getOrderById', () => {
  it('throws a 404 for an unknown order', async () => {
    await expect(getOrderById('00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({
      statusCode: 404
    })
  })
})

describe('updateOrderStatus', () => {
  it('applies a valid forward transition', async () => {
    const product = must((await getProducts())[0])
    const order = await createOrder({ items: [{ productId: product.id, quantity: 1 }] })

    const updated = await updateOrderStatus(order.id, 'preparing')
    expect(updated.status).toBe('preparing')
  })

  it('rejects an invalid transition', async () => {
    const product = must((await getProducts())[0])
    const order = await createOrder({ items: [{ productId: product.id, quantity: 1 }] })

    await expect(updateOrderStatus(order.id, 'delivered')).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('rejects a transition on an unknown order', async () => {
    await expect(
      updateOrderStatus('00000000-0000-0000-0000-000000000000', 'preparing')
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('getOrderUpdates', () => {
  it('returns every order on initial sync (no since)', async () => {
    const product = must((await getProducts())[0])
    await createOrder({ items: [{ productId: product.id, quantity: 1 }] })

    const { orders, serverTime } = await getOrderUpdates()
    expect(orders).toHaveLength(1)
    expect(typeof serverTime).toBe('string')
  })

  it('returns only orders updated after the given timestamp', async () => {
    const product = must((await getProducts())[0])
    const order = await createOrder({ items: [{ productId: product.id, quantity: 1 }] })
    const { serverTime: cursor } = await getOrderUpdates()

    const noChanges = await getOrderUpdates(cursor)
    expect(noChanges.orders).toHaveLength(0)

    // Guarantee the next updatedAt timestamp is strictly after the cursor,
    // even on a fast machine where both could otherwise land in the same ms.
    await new Promise((resolve) => setTimeout(resolve, 5))
    await updateOrderStatus(order.id, 'preparing')
    const afterUpdate = await getOrderUpdates(cursor)
    expect(afterUpdate.orders.map((o) => o.id)).toEqual([order.id])
  })
})
