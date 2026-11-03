import { describe, expect, it } from 'vitest'
import { getNextOrderStatus, isValidOrderStatusTransition } from './order-status'

describe('isValidOrderStatusTransition', () => {
  it.each([
    ['new', 'preparing'],
    ['preparing', 'ready'],
    ['ready', 'delivered']
  ] as const)('allows %s -> %s', (from, to) => {
    expect(isValidOrderStatusTransition(from, to)).toBe(true)
  })

  it.each([
    ['new', 'ready'],
    ['new', 'delivered'],
    ['preparing', 'delivered'],
    ['preparing', 'new'],
    ['ready', 'new'],
    ['ready', 'preparing'],
    ['delivered', 'new'],
    ['delivered', 'ready']
  ] as const)('rejects %s -> %s', (from, to) => {
    expect(isValidOrderStatusTransition(from, to)).toBe(false)
  })

  it('rejects a no-op transition', () => {
    expect(isValidOrderStatusTransition('new', 'new')).toBe(false)
  })

  it('treats delivered as a terminal state', () => {
    expect(isValidOrderStatusTransition('delivered', 'delivered')).toBe(false)
  })
})

describe('getNextOrderStatus', () => {
  it.each([
    ['new', 'preparing'],
    ['preparing', 'ready'],
    ['ready', 'delivered']
  ] as const)('returns %s -> %s', (from, to) => {
    expect(getNextOrderStatus(from)).toBe(to)
  })

  it('returns null for the terminal delivered state', () => {
    expect(getNextOrderStatus('delivered')).toBeNull()
  })
})
