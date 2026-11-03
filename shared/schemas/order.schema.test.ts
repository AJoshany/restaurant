import { describe, expect, it } from 'vitest'
import {
  CreateOrderRequestSchema,
  OrderSchema,
  UpdateOrderStatusRequestSchema
} from './order.schema'

const validOrder = {
  id: '11111111-1111-4111-8111-111111111111',
  orderNumber: 'ORD-000001',
  items: [
    {
      productId: '22222222-2222-4222-8222-222222222222',
      productName: { 'en-US': 'Sample Product 1', 'fa-IR': 'محصول نمونه ۱' },
      unitPrice: 50000,
      quantity: 2,
      subtotal: 100000
    }
  ],
  totalAmount: 100000,
  status: 'new',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

describe('OrderSchema', () => {
  it('accepts a valid order', () => {
    expect(OrderSchema.safeParse(validOrder).success).toBe(true)
  })

  it('rejects an order with no items', () => {
    const result = OrderSchema.safeParse({ ...validOrder, items: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown status value', () => {
    const result = OrderSchema.safeParse({ ...validOrder, status: 'cancelled' })
    expect(result.success).toBe(false)
  })
})

describe('CreateOrderRequestSchema', () => {
  it('accepts a request with at least one valid item', () => {
    const result = CreateOrderRequestSchema.safeParse({
      items: [{ productId: '22222222-2222-4222-8222-222222222222', quantity: 1 }]
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty items array', () => {
    const result = CreateOrderRequestSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })

  it('rejects a non-uuid product id', () => {
    const result = CreateOrderRequestSchema.safeParse({
      items: [{ productId: 'not-a-uuid', quantity: 1 }]
    })
    expect(result.success).toBe(false)
  })

  it('rejects a zero quantity', () => {
    const result = CreateOrderRequestSchema.safeParse({
      items: [{ productId: '22222222-2222-4222-8222-222222222222', quantity: 0 }]
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer quantity', () => {
    const result = CreateOrderRequestSchema.safeParse({
      items: [{ productId: '22222222-2222-4222-8222-222222222222', quantity: 1.5 }]
    })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed payload', () => {
    expect(CreateOrderRequestSchema.safeParse({ foo: 'bar' }).success).toBe(false)
    expect(CreateOrderRequestSchema.safeParse(null).success).toBe(false)
  })
})

describe('UpdateOrderStatusRequestSchema', () => {
  it('accepts a known status', () => {
    expect(UpdateOrderStatusRequestSchema.safeParse({ status: 'preparing' }).success).toBe(true)
  })

  it('rejects an unknown status', () => {
    expect(UpdateOrderStatusRequestSchema.safeParse({ status: 'archived' }).success).toBe(false)
  })

  it('rejects a missing status', () => {
    expect(UpdateOrderStatusRequestSchema.safeParse({}).success).toBe(false)
  })
})
