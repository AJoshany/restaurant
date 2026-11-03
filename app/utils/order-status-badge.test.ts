import { describe, expect, it } from 'vitest'
import { getOrderStatusBadgeVariant } from './order-status-badge'

describe('getOrderStatusBadgeVariant', () => {
  it.each([
    ['new', 'info'],
    ['preparing', 'warning'],
    ['ready', 'brand'],
    ['delivered', 'success']
  ] as const)('maps %s -> %s', (status, variant) => {
    expect(getOrderStatusBadgeVariant(status)).toBe(variant)
  })
})
