import { describe, expect, it } from 'vitest'
import type { Order } from '#shared/schemas/order.schema'
import { mergeOrderUpdates } from './order-updates'

function makeOrder(id: string, overrides: Partial<Order> = {}): Order {
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
    status: 'new',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('mergeOrderUpdates', () => {
  it('returns the current list unchanged when there are no updates', () => {
    const current = [makeOrder('a')]
    expect(mergeOrderUpdates(current, [])).toBe(current)
  })

  it('appends orders not already present', () => {
    const current = [makeOrder('a')]
    const result = mergeOrderUpdates(current, [makeOrder('b')])
    expect(result.map((order) => order.id)).toEqual(['a', 'b'])
  })

  it('replaces an existing order by id, preserving its position', () => {
    const current = [makeOrder('a'), makeOrder('b', { status: 'preparing' })]
    const updated = makeOrder('a', { status: 'preparing', updatedAt: '2026-01-01T00:05:00.000Z' })

    const result = mergeOrderUpdates(current, [updated])

    expect(result.map((order) => order.id)).toEqual(['a', 'b'])
    expect(result[0]).toEqual(updated)
  })

  it('leaves orders not referenced by the update untouched', () => {
    const untouched = makeOrder('a')
    const result = mergeOrderUpdates(
      [untouched, makeOrder('b')],
      [makeOrder('b', { status: 'ready' })]
    )
    expect(result[0]).toBe(untouched)
  })
})
