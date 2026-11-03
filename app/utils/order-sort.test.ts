import { describe, expect, it } from 'vitest'
import type { Order } from '#shared/schemas/order.schema'
import { ORDER_SORT_OPTIONS, sortOrders } from './order-sort'

function makeOrder(id: string, createdAt: string, totalAmount: number): Order {
  return {
    id,
    orderNumber: `ORD-${id}`,
    items: [
      {
        productId: '11111111-1111-4111-8111-111111111111',
        productName: { 'en-US': 'Sample', 'fa-IR': 'نمونه' },
        unitPrice: totalAmount,
        quantity: 1,
        subtotal: totalAmount
      }
    ],
    totalAmount,
    status: 'new',
    createdAt,
    updatedAt: createdAt
  }
}

const orders = [
  makeOrder('a', '2026-01-01T00:00:00.000Z', 3000),
  makeOrder('b', '2026-01-03T00:00:00.000Z', 1000),
  makeOrder('c', '2026-01-02T00:00:00.000Z', 2000)
]

describe('sortOrders', () => {
  it('sorts newest first by createdAt descending', () => {
    expect(sortOrders(orders, 'newest').map((order) => order.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts oldest first by createdAt ascending', () => {
    expect(sortOrders(orders, 'oldest').map((order) => order.id)).toEqual(['a', 'c', 'b'])
  })

  it('sorts by total amount descending', () => {
    expect(sortOrders(orders, 'totalDesc').map((order) => order.id)).toEqual(['a', 'c', 'b'])
  })

  it('sorts by total amount ascending', () => {
    expect(sortOrders(orders, 'totalAsc').map((order) => order.id)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the input array', () => {
    const copy = [...orders]
    sortOrders(orders, 'newest')
    expect(orders).toEqual(copy)
  })

  it('exposes every sort option exactly once', () => {
    expect(ORDER_SORT_OPTIONS).toEqual(['newest', 'oldest', 'totalDesc', 'totalAsc'])
  })
})
