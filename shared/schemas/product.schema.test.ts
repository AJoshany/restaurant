import { describe, expect, it } from 'vitest'
import { ProductSchema } from './product.schema'

const validProduct = {
  id: '11111111-1111-4111-8111-111111111111',
  name: { 'en-US': 'Sample Product 1', 'fa-IR': 'محصول نمونه ۱' },
  image: '/images/products/placeholder-1.svg',
  price: 50000,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

describe('ProductSchema', () => {
  it('accepts a valid product', () => {
    expect(ProductSchema.safeParse(validProduct).success).toBe(true)
  })

  it('rejects a non-uuid id', () => {
    const result = ProductSchema.safeParse({ ...validProduct, id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects a product missing the Persian name', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      name: { 'en-US': 'Sample Product 1' }
    })
    expect(result.success).toBe(false)
  })

  it('rejects a negative price', () => {
    const result = ProductSchema.safeParse({ ...validProduct, price: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer price', () => {
    const result = ProductSchema.safeParse({ ...validProduct, price: 10.5 })
    expect(result.success).toBe(false)
  })
})
