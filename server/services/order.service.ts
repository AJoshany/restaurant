import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { calculateOrderTotal } from '#shared/domain/order-total'
import { formatOrderNumber } from '#shared/domain/order-number'
import { isValidOrderStatusTransition, type OrderStatus } from '#shared/domain/order-status'
import type { CreateOrderRequest, Order, OrderItem } from '#shared/schemas/order.schema'
import { readData, writeData } from '../utils/storage'

export interface GetOrdersOptions {
  status?: OrderStatus
  sort?: 'asc' | 'desc'
}

export interface OrderUpdates {
  orders: Order[]
  serverTime: string
}

export async function getOrders(options: GetOrdersOptions = {}): Promise<Order[]> {
  const { orders } = await readData()
  const filtered = options.status
    ? orders.filter((order) => order.status === options.status)
    : orders
  const direction = options.sort === 'asc' ? 1 : -1

  return [...filtered].sort(
    (a, b) => direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  )
}

export async function getOrderById(id: string): Promise<Order> {
  const { orders } = await readData()
  const order = orders.find((candidate) => candidate.id === id)

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: `Order ${id} not found` })
  }

  return order
}

/**
 * Validates referenced products, snapshots their current name/price, and
 * computes the total - all inside the writeData mutator so it runs under the
 * same read-modify-write cycle as the persisted write, protecting against a
 * concurrent product price/active change between validation and persistence.
 */
export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  const now = new Date().toISOString()
  let createdOrder: Order | null = null

  await writeData((current) => {
    const items: OrderItem[] = request.items.map((requestedItem) => {
      const product = current.products.find((candidate) => candidate.id === requestedItem.productId)

      if (!product) {
        throw createError({
          statusCode: 404,
          statusMessage: `Product ${requestedItem.productId} not found`
        })
      }
      if (!product.isActive) {
        throw createError({
          statusCode: 400,
          statusMessage: `Product ${product.id} is not available`
        })
      }

      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: requestedItem.quantity,
        subtotal: product.price * requestedItem.quantity
      }
    })

    const nextSequence = current.orderSequence + 1
    const newOrder: Order = {
      id: randomUUID(),
      orderNumber: formatOrderNumber(nextSequence),
      items,
      totalAmount: calculateOrderTotal(items),
      status: 'new',
      createdAt: now,
      updatedAt: now
    }

    createdOrder = newOrder
    return {
      ...current,
      orders: [...current.orders, newOrder],
      orderSequence: nextSequence
    }
  })

  if (!createdOrder) {
    throw createError({ statusCode: 500, statusMessage: 'Order creation failed unexpectedly' })
  }

  return createdOrder
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const now = new Date().toISOString()
  let updatedOrder: Order | null = null

  await writeData((current) => {
    const order = current.orders.find((candidate) => candidate.id === id)

    if (!order) {
      throw createError({ statusCode: 404, statusMessage: `Order ${id} not found` })
    }
    if (!isValidOrderStatusTransition(order.status, status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot transition order from "${order.status}" to "${status}"`
      })
    }

    const updated: Order = { ...order, status, updatedAt: now }
    updatedOrder = updated

    return {
      ...current,
      orders: current.orders.map((candidate) => (candidate.id === id ? updated : candidate))
    }
  })

  if (!updatedOrder) {
    throw createError({ statusCode: 500, statusMessage: 'Order status update failed unexpectedly' })
  }

  return updatedOrder
}

/**
 * Polling sync contract: omitting `since` returns every order (initial
 * sync); otherwise only orders updated after `since`. See docs/api-reference.md.
 */
export async function getOrderUpdates(since?: string): Promise<OrderUpdates> {
  const { orders } = await readData()
  const serverTime = new Date().toISOString()

  if (!since) {
    return { orders, serverTime }
  }

  const sinceTime = new Date(since).getTime()
  const changed = orders.filter((order) => new Date(order.updatedAt).getTime() > sinceTime)

  return { orders: changed, serverTime }
}
