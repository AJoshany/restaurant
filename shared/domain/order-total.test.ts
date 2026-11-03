import { describe, expect, it } from 'vitest'
import { calculateItemSubtotal, calculateOrderTotal } from './order-total'

describe('calculateItemSubtotal', () => {
  it('multiplies unit price by quantity', () => {
    expect(calculateItemSubtotal(1000, 3)).toBe(3000)
  })

  it('returns 0 for a free item', () => {
    expect(calculateItemSubtotal(0, 5)).toBe(0)
  })
})

describe('calculateOrderTotal', () => {
  it('sums subtotals across items', () => {
    const total = calculateOrderTotal([
      { unitPrice: 1000, quantity: 2 },
      { unitPrice: 500, quantity: 3 }
    ])
    expect(total).toBe(1000 * 2 + 500 * 3)
  })

  it('returns 0 for an empty item list', () => {
    expect(calculateOrderTotal([])).toBe(0)
  })
})
