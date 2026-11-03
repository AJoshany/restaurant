import { describe, expect, it } from 'vitest'
import type { Order } from '#shared/schemas/order.schema'
import { countOrdersByStatus, filterOrdersByStatus } from './order-filter'

function makeOrder(id: string, status: Order['status']): Order {
  return {
    id,
    orderNumber: `ORD-${id}`,
    items: [
      {
        productId: '11111111-1111-4111-8111-111111111111',
        productName: { 'en-US': 'Sample', 'fa-IR': 'نمونه' },
        unitPrice: 1000,
        quantity: 1,
        subtotal: 1000
      }
    ],
    totalAmount: 1000,
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
}

const orders = [
  makeOrder('a', 'new'),
  makeOrder('b', 'new'),
  makeOrder('c', 'preparing'),
  makeOrder('d', 'ready'),
  makeOrder('e', 'delivered')
]

describe('filterOrdersByStatus', () => {
  it('returns every order for "all"', () => {
    expect(filterOrdersByStatus(orders, 'all')).toEqual(orders)
  })

  it.each(['new', 'preparing', 'ready', 'delivered'] as const)(
    'returns only %s orders',
    (status) => {
      const result = filterOrdersByStatus(orders, status)
      expect(result.every((order) => order.status === status)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    }
  )

  it('returns an empty array when no order matches', () => {
    expect(filterOrdersByStatus([makeOrder('a', 'new')], 'delivered')).toEqual([])
  })
})

describe('countOrdersByStatus', () => {
  it('counts orders per status, including zero for absent statuses', () => {
    expect(countOrdersByStatus(orders)).toEqual({
      new: 2,
      preparing: 1,
      ready: 1,
      delivered: 1
    })
  })

  it('returns all-zero counts for an empty list', () => {
    expect(countOrdersByStatus([])).toEqual({
      new: 0,
      preparing: 0,
      ready: 0,
      delivered: 0
    })
  })
})
